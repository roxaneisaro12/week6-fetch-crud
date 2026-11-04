import "./style.css";
import {
  loadPosts,
  setupPostFilters,
  setupPostForm,
} from "./posts.js";

document.querySelector("#app").innerHTML = `
  <header class="bg-white border-b border-slate-200">
    <nav class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <a href="#" class="text-xl font-bold tracking-tight text-slate-900">
        Post<span class="text-indigo-600">Manager</span>
      </a>

      <span class="text-sm text-slate-500">
        Week 6 - Fetch API
      </span>
    </nav>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-10">

    <section class="mb-10">
      <p class="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">
        Content management
      </p>

      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
        Manage your posts
      </h1>

      <p class="text-slate-500 max-w-2xl">
        Create, view, edit and delete posts using the JavaScript Fetch API.
      </p>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-900">
            Create a new post
          </h2>
          <span class="text-xs text-slate-400">POST</span>
        </div>

        <form id="post-form" class="space-y-4">

          <div>
            <label for="title" class="block text-sm font-medium text-slate-700 mb-2">
              Post title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter your post title"
              minlength="3"
              maxlength="100"
              required
              class="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p class="text-xs text-slate-400 mt-1">
              Minimum 3 characters, maximum 100.
            </p>
          </div>

          <div>
            <label for="body" class="block text-sm font-medium text-slate-700 mb-2">
              Post content
            </label>

            <textarea
              id="body"
              name="body"
              rows="4"
              placeholder="Write something interesting..."
              minlength="10"
              maxlength="1000"
              required
              class="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
            <p class="text-xs text-slate-400 mt-1">
              Minimum 10 characters, maximum 1000.
            </p>
          </div>

          <div class="flex justify-between items-center gap-4">
            <p id="form-status" class="text-sm text-slate-500" aria-live="polite"></p>

            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Publish post
            </button>
          </div>

        </form>
      </div>

    </section>

    <section class="bg-white border border-slate-200 rounded-xl p-6">

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        <div>
          <h2 class="text-xl font-bold text-slate-900">
            All posts
          </h2>

          <p class="text-sm text-slate-500 mt-1">
            Browse and manage published posts.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <label for="user-filter" class="text-sm font-medium text-slate-600">
            Filter by user:
          </label>

          <select
            id="user-filter"
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All users</option>
            ${Array.from({ length: 10 }, (_, i) =>
              `<option value="${i + 1}">User ${i + 1}</option>`
            ).join("")}
          </select>

          <button
            id="refresh-posts"
            type="button"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Refresh posts
          </button>
        </div>

      </div>

      <div id="posts-status" class="text-sm text-slate-500 py-6" aria-live="polite">
        Posts will appear here.
      </div>

      <div id="posts-list" class="grid grid-cols-1 md:grid-cols-2 gap-5"></div>

    </section>

  </main>

  <footer class="text-center py-8 text-sm text-slate-500">
    Week 6 - HTTP, APIs and Node.js - Fetch API Practice
  </footer>
`;

loadPosts();
setupPostFilters();
setupPostForm();

const refreshButton = document.querySelector("#refresh-posts");

refreshButton.addEventListener("click", async () => {
  const selectedUser = document.querySelector("#user-filter").value;

  refreshButton.disabled = true;
  refreshButton.textContent = "Refreshing...";

  try {
    await loadPosts(selectedUser === "all" ? null : selectedUser);
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh posts";
  }
});