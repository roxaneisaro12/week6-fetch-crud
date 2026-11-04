
import { api } from "./api/http.js";

// Store the posts received from the API
let posts = [];

// Get the HTML elements
const postsList = document.querySelector("#posts-list");
const postsStatus = document.querySelector("#posts-status");

// Display posts on the page
function renderPosts() {
  postsList.replaceChildren();

  posts.forEach((post) => {
    const card = document.createElement("article");

    card.className =
      "bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors";

    const user = document.createElement("p");
    user.className =
      "text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3";
    user.textContent = `User ${post.userId}`;

    const title = document.createElement("h3");
    title.className =
      "text-lg font-semibold text-slate-900 mb-3 capitalize";
    title.textContent = post.title;

    const body = document.createElement("p");
    body.className =
      "text-sm text-slate-600 leading-6";
    body.textContent = post.body;

    card.append(user, title, body);
    postsList.appendChild(card);
  });
}

// Fetch posts from JSONPlaceholder
export async function loadPosts() {
  postsStatus.textContent = "Loading posts...";
  postsList.replaceChildren();

  try {
    const params = new URLSearchParams({
      _limit: "10",
    });

    posts = await api.get(`/posts?${params}`);

    if (posts.length === 0) {
      postsStatus.textContent = "No posts found.";
      return;
    }

    renderPosts();

    postsStatus.textContent =
      `Showing ${posts.length} posts`;
  } catch (error) {
    postsStatus.textContent =
      error.name === "TimeoutError" || error.name === "AbortError"
        ? "The request took too long. Please try again."
        : `Could not load posts: ${error.message}`;
  }
}
