
import { api } from "./api/http.js";

let posts = [];

// Display posts on the page
function renderPosts() {
  const postsList = document.querySelector("#posts-list");

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
    body.className = "text-sm text-slate-600 leading-6";
    body.textContent = post.body;

    card.append(user, title, body);
    postsList.appendChild(card);
  });
}

// Fetch posts from JSONPlaceholder
export async function loadPosts(userId = null) {
  const postsStatus = document.querySelector("#posts-status");
  const postsList = document.querySelector("#posts-list");

  postsStatus.textContent = "Loading posts...";
  postsList.replaceChildren();

  try {
    const params = new URLSearchParams();

    if (userId) {
      params.set("userId", userId);
    } else {
      params.set("_limit", "10");
    }

    posts = await api.get(`/posts?${params.toString()}`);

    if (posts.length === 0) {
      postsStatus.textContent = "No posts found.";
      return;
    }

    renderPosts();

    postsStatus.textContent = `Showing ${posts.length} posts`;
  } catch (error) {
    postsStatus.textContent =
      error.name === "TimeoutError" || error.name === "AbortError"
        ? "The request took too long. Please try again."
        : `Could not load posts: ${error.message}`;
  }
}

// Set up the user filter
export function setupPostFilters() {
  const userFilter = document.querySelector("#user-filter");

  userFilter.addEventListener("change", (event) => {
    const selectedUser = event.target.value;

    if (selectedUser === "all") {
      loadPosts();
    } else {
      loadPosts(selectedUser);
    }
  });
}

export function setupPostForm() {
  const form = document.querySelector("#post-form");
  const formStatus = document.querySelector("#form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const newPost = {
      title: formData.get("title").trim(),
      body: formData.get("body").trim(),
      userId: 1,
    };

    if (!newPost.title || !newPost.body) {
      formStatus.textContent = "Please complete both fields.";
      return;
    }

    submitButton.disabled = true;
    formStatus.textContent = "Publishing post...";

    try {
      const createdPost = await api.post("/posts", newPost);

      posts.unshift(createdPost);
      renderPosts();

      document.querySelector("#posts-status").textContent =
        `Showing ${posts.length} posts`;

      form.reset();
      formStatus.textContent = "Post published successfully!";
    } catch (error) {
      formStatus.textContent = `Could not publish post: ${error.message}`;
    } finally {
      submitButton.disabled = false;
    }
  });
}
