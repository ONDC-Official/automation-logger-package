/**
 * A TypeScript script to trigger a specific GitHub Actions workflow for all branches in a repository.
 *
 * @usage
 * 1. Make sure you have Node.js and ts-node installed.
 * 2. Install dependencies: npm install axios
 * 3. Run the script from your terminal:
 * GITHUB_TOKEN="your_personal_access_token" \
 * ts-node rerun-workflow-for-all-branches.ts \
 * --owner="your-github-username" \
 * --repo="your-repo-name" \
 * --workflow="your-workflow-file.yml"
 *
 * @notes
 * - The target workflow file MUST be configured to run on the `workflow_dispatch` event.
 * - The GitHub Personal Access Token (PAT) needs the `repo` scope.
 */

import axios, { AxiosInstance } from "axios";

// --- CONFIGURATION ---
// You can hardcode these values, but using command-line arguments is recommended for flexibility.
interface ScriptArgs {
	owner: string;
	repo: string;
	workflow: string; // The filename of the workflow, e.g., 'ci.yml'
	token: string;
}

/**
 * Parses command-line arguments.
 * Example: --owner="my-org" --repo="my-project"
 */
function parseArgs(): ScriptArgs {
	const args: { [key: string]: string } = {};
	process.argv.slice(2).forEach((arg) => {
		if (arg.startsWith("--")) {
			const [key, value] = arg.substring(2).split("=");
			if (key && value) {
				args[key] = value.replace(/"/g, "");
			}
		}
	});

	const token = process.env.GITHUB_TOKEN;

	if (!args.owner || !args.repo || !args.workflow || !token) {
		console.error(`
      Error: Missing required arguments or environment variable.
      Please provide --owner, --repo, --workflow, and set the GITHUB_TOKEN environment variable.

      Usage:
      GITHUB_TOKEN="your_pat" ts-node ${process.argv[1]} --owner="owner-name" --repo="repo-name" --workflow="workflow-file.yml"
    `);
		process.exit(1);
	}

	return {
		owner: args.owner,
		repo: args.repo,
		workflow: args.workflow,
		token: token,
	};
}

/**
 * Fetches all branch names from a GitHub repository.
 * Handles pagination to retrieve all branches if there are more than 100.
 * @param apiClient - An Axios instance configured for the GitHub API.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns A promise that resolves to an array of branch names.
 */
async function getAllBranches(
	apiClient: AxiosInstance,
	owner: string,
	repo: string
): Promise<string[]> {
	console.log(`Fetching branches for ${owner}/${repo}...`);
	const allBranches: string[] = [];
	let page = 1;
	const perPage = 100; // Max allowed by GitHub API

	try {
		while (true) {
			const response = await apiClient.get(`/repos/${owner}/${repo}/branches`, {
				params: {
					per_page: perPage,
					page: page,
				},
			});

			const branchesOnPage = response.data.map(
				(branch: { name: string }) => branch.name
			);
			if (branchesOnPage.length === 0) {
				// No more branches to fetch
				break;
			}

			allBranches.push(...branchesOnPage);
			console.log(
				`Found ${branchesOnPage.length} branches on page ${page}. Total so far: ${allBranches.length}`
			);
			page++;
		}
		console.log(
			`✅ Successfully fetched a total of ${allBranches.length} branches.`
		);
		return allBranches;
	} catch (error: any) {
		console.error(
			`❌ Error fetching branches: ${
				error.response?.data?.message || error.message
			}`
		);
		throw error;
	}
}

/**
 * Triggers a workflow_dispatch event for a specific workflow on a given branch.
 * @param apiClient - An Axios instance configured for the GitHub API.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param workflow - The workflow file name.
 * @param branch - The branch to run the workflow on.
 */
async function triggerWorkflowDispatch(
	apiClient: AxiosInstance,
	owner: string,
	repo: string,
	workflow: string,
	branch: string
): Promise<void> {
	console.log(
		`  -> Triggering workflow '${workflow}' for branch '${branch}'...`
	);
	try {
		const response = await apiClient.post(
			`/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
			{
				ref: branch, // The branch, tag, or commit SHA to run the workflow on
			}
		);

		if (response.status === 204) {
			console.log(
				`  ✅ Successfully dispatched workflow for branch '${branch}'.`
			);
		} else {
			console.warn(
				`  ⚠️ Received status ${response.status} for branch '${branch}'. Check GitHub Actions to confirm.`
			);
		}
	} catch (error: any) {
		const errorMessage = error.response?.data?.message || error.message;
		console.error(
			`  ❌ Failed to dispatch workflow for branch '${branch}': ${errorMessage}`
		);
		// If the error message indicates the workflow doesn't have a workflow_dispatch trigger, provide a helpful hint.
		if (errorMessage.includes("does not have a workflow_dispatch trigger")) {
			console.error(
				`     Hint: Make sure your '${workflow}' file contains 'on: workflow_dispatch'`
			);
		}
	}
}

/**
 * Main function to orchestrate the process.
 */
async function main() {
	const { owner, repo, workflow, token } = parseArgs();

	console.log("--- Starting Workflow Rerun Script ---");
	console.log(`Repository: ${owner}/${repo}`);
	console.log(`Workflow File: ${workflow}`);
	console.log("--------------------------------------\n");

	// Create a pre-configured Axios instance for GitHub API calls
	const apiClient = axios.create({
		baseURL: "https://api.github.com",
		headers: {
			Authorization: `token ${token}`,
			Accept: "application/vnd.github.v3+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	try {
		// Step 1: Get all branches
		const branches = await getAllBranches(apiClient, owner, repo);

		if (branches.length === 0) {
			console.log("No branches found. Exiting.");
			return;
		}

		// Step 2: Trigger the workflow for each branch sequentially
		console.log(
			`\n--- Triggering workflows for ${branches.length} branches ---`
		);
		for (const branch of branches) {
			if (branch.startsWith("draft") || branch.startsWith("release")) {
				await triggerWorkflowDispatch(apiClient, owner, repo, workflow, branch);
				// Optional: Add a small delay to avoid hitting secondary rate limits
				await new Promise((resolve) => setTimeout(resolve, 10000));
			}
		}

		console.log("\n--- All Done! ---");
		console.log(
			'✅ Script finished. Please check the "Actions" tab in your GitHub repository to see the running workflows.'
		);
	} catch (error) {
		console.error(
			"\n❌ An unrecoverable error occurred. The script will now exit."
		);
		process.exit(1);
	}
}

// Execute the main function
main();
