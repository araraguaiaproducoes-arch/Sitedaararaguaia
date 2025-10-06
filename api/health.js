export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "present" : "missing",
    ADMIN_PASS: process.env.ADMIN_PASS ? "present" : "missing",
    GITHUB_TOKEN: process.env.GITHUB_TOKEN ? "present" : "missing",
    GITHUB_OWNER: process.env.GITHUB_OWNER ? "present" : "missing",
    GITHUB_REPO: process.env.GITHUB_REPO ? "present" : "missing",
    GITHUB_BRANCH: process.env.GITHUB_BRANCH || "main"
  });
}