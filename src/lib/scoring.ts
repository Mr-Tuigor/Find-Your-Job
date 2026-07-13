/**
 * Smart keyword-based match scoring.
 * Cross-references resume keywords against a job description string.
 *
 * Improvements over naive exact-match:
 * 1. Synonym/alias matching (e.g. "JS" matches "JavaScript")
 * 2. Skill-family grouping (e.g. "React" partially matches "Vue.js" within frontend frameworks)
 * 3. Multi-word phrase matching
 * 4. Job title relevance bonus
 * 5. Required-skills intersection bonus
 * 6. Weighted scoring: core tech skills count more than generic keywords
 */

// Common skill synonyms & aliases
const SYNONYMS: Record<string, string[]> = {
  javascript: ["js", "ecmascript", "es6", "es2015", "es2020", "es2021"],
  typescript: ["ts"],
  "react": ["reactjs", "react.js"],
  "next.js": ["nextjs", "next"],
  "node.js": ["nodejs", "node"],
  "vue.js": ["vuejs", "vue"],
  angular: ["angularjs", "angular.js"],
  python: ["py", "python3"],
  "c++": ["cpp"],
  "c#": ["csharp", "c-sharp"],
  postgresql: ["postgres", "psql"],
  mongodb: ["mongo"],
  kubernetes: ["k8s"],
  "amazon web services": ["aws"],
  "google cloud platform": ["gcp"],
  "microsoft azure": ["azure"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
  "natural language processing": ["nlp"],
  "continuous integration": ["ci"],
  "continuous deployment": ["cd"],
  "ci/cd": ["ci-cd", "cicd"],
  "html": ["html5"],
  "css": ["css3"],
  "rest": ["restful", "rest api", "restapi"],
  "graphql": ["gql"],
  "docker": ["containerization"],
  "git": ["github", "gitlab", "bitbucket"],
  "sql": ["mysql", "sqlite", "mssql"],
  "api": ["apis", "web api", "web apis"],
  "tailwind": ["tailwindcss", "tailwind css"],
  "express": ["expressjs", "express.js"],
  "django": ["djangorestframework"],
  "flask": ["flask-restful"],
  "spring": ["spring boot", "springboot"],
  "java": ["jdk", "jvm"],
  "swift": ["swiftui"],
  "kotlin": ["kotlinx"],
  "figma": ["sketch", "adobe xd"],
  "agile": ["scrum", "kanban", "sprint"],
  "devops": ["sre", "site reliability"],
  "data science": ["data analysis", "data analytics"],
  "deep learning": ["dl", "neural network", "neural networks"],
  "tensorflow": ["tf"],
  "pytorch": ["torch"],
};

// Skill families: skills in the same family get partial credit
const SKILL_FAMILIES: string[][] = [
  ["react", "vue.js", "angular", "svelte", "solid.js", "preact"],
  ["node.js", "express", "fastify", "koa", "nest.js", "hapi"],
  ["python", "django", "flask", "fastapi"],
  ["java", "spring", "spring boot", "kotlin"],
  ["aws", "gcp", "azure", "cloud"],
  ["postgresql", "mysql", "sql", "sqlite", "mariadb", "oracle"],
  ["mongodb", "dynamodb", "couchdb", "firebase", "firestore", "nosql"],
  ["docker", "kubernetes", "podman", "containerd"],
  ["tensorflow", "pytorch", "keras", "scikit-learn", "jax"],
  ["git", "github", "gitlab", "bitbucket", "version control"],
  ["figma", "sketch", "adobe xd", "invision"],
  ["html", "css", "sass", "less", "tailwind", "bootstrap"],
  ["rest", "graphql", "grpc", "websocket"],
  ["redis", "memcached", "caching"],
  ["jenkins", "github actions", "circleci", "travis ci", "gitlab ci"],
  ["jest", "mocha", "vitest", "cypress", "playwright", "testing"],
  ["typescript", "javascript"],
  ["c++", "c", "rust", "go", "golang"],
  ["linux", "unix", "ubuntu", "debian", "centos"],
];

/**
 * Build a reverse lookup: normalized keyword → canonical name
 */
function buildSynonymMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
    map.set(canonical, canonical);
    for (const alias of aliases) {
      map.set(alias, canonical);
    }
  }
  return map;
}

const synonymMap = buildSynonymMap();

/**
 * Normalize a string for matching: lowercase, strip punctuation, extra spaces.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve a keyword to its canonical form
 */
function canonicalize(keyword: string): string {
  const norm = normalize(keyword);
  return synonymMap.get(norm) || norm;
}

/**
 * Check if two skills belong to the same family
 */
function areInSameFamily(skill1: string, skill2: string): boolean {
  const s1 = canonicalize(skill1);
  const s2 = canonicalize(skill2);
  return SKILL_FAMILIES.some(
    (family) => family.includes(s1) && family.includes(s2)
  );
}

/**
 * Calculate a match score (0–100) by comparing resume keywords against job text.
 *
 * Scoring weights:
 * - Exact/synonym match in job description = 1.0
 * - Same skill-family match = 0.4
 * - Partial/substring match = 0.5
 * - Stem/prefix match = 0.3
 *
 * Bonuses:
 * - Job title keyword overlap bonus (up to +15)
 * - Required skills intersection bonus (up to +10)
 * - High overlap multiplier
 */
export function calculateMatchScore(
  resumeKeywords: string[],
  jobDescription: string,
  jobTitle?: string,
  jobRequiredSkills?: string[] | null
): number {
  if (!resumeKeywords.length || !jobDescription) return 0;

  const normalizedDesc = normalize(jobDescription);
  const descWords = new Set(normalizedDesc.split(" "));

  // Also canonicalize all words in the description for synonym matching
  const descCanonicals = new Set(
    Array.from(descWords).map((w) => synonymMap.get(w) || w)
  );

  // Canonicalize multi-word phrases in description
  const normalizedTitle = jobTitle ? normalize(jobTitle) : "";

  let weightedMatches = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of resumeKeywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;

    const canonicalKeyword = canonicalize(keyword);
    let matched = false;

    // 1. Exact word match (including synonym resolution)
    if (descWords.has(normalizedKeyword) || descCanonicals.has(canonicalKeyword)) {
      weightedMatches += 1.0;
      matchedKeywords.push(keyword);
      matched = true;
    }

    // 2. Multi-word phrase exact match
    if (!matched && normalizedKeyword.includes(" ") && normalizedDesc.includes(normalizedKeyword)) {
      weightedMatches += 1.0;
      matchedKeywords.push(keyword);
      matched = true;
    }



    // 4. Skill-family match: check if any word in desc is in the same skill family
    if (!matched) {
      for (const descWord of descWords) {
        if (areInSameFamily(normalizedKeyword, descWord)) {
          weightedMatches += 0.25;
          matchedKeywords.push(keyword);
          matched = true;
          break;
        }
      }
    }


  }

  // Base percentage calculation with curve
  // A job description typically contains a limited set of core skills.
  // We cap the required keyword denominator so highly detailed resumes aren't penalized.
  const MAX_EXPECTED_KEYWORDS = 25;
  const denominator = Math.min(resumeKeywords.length, MAX_EXPECTED_KEYWORDS);

  const baseRatio = Math.min(1.0, weightedMatches / denominator);

  // Curve the score slightly to boost good matches
  const curvedRatio = Math.min(1.0, baseRatio * 1.1);
  let score = curvedRatio * 100;

  // BONUS 1: Job title relevance (up to +10 points)
  // If resume keywords appear in the job title, it's a strong match signal
  if (normalizedTitle) {
    let titleHits = 0;
    for (const kw of resumeKeywords) {
      const nkw = normalize(kw);
      if (nkw && normalizedTitle.includes(nkw)) {
        titleHits++;
      }
    }
    const titleBonus = Math.min(10, (titleHits / Math.max(1, normalizedTitle.split(" ").length)) * 15);
    score += titleBonus;
  }

  // BONUS 2: Required skills intersection (up to +8 points)
  if (jobRequiredSkills && jobRequiredSkills.length > 0) {
    const resumeCanonicals = new Set(resumeKeywords.map(canonicalize));
    let reqHits = 0;
    for (const reqSkill of jobRequiredSkills) {
      const canonical = canonicalize(reqSkill);
      if (resumeCanonicals.has(canonical)) {
        reqHits++;
      }
    }
    const reqBonus = Math.min(8, (reqHits / jobRequiredSkills.length) * 12);
    score += reqBonus;
  }

  return Math.min(100, Math.round(score));
}
