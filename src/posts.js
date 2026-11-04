
import { api } from "./api/http.js";

let posts = [];

function renderPosts() {
  const postsList = document.querySelector("#posts-list");
  postsList.replaceChildren();

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className =
      "bg-slate-50 border border-slate-200 rounded-xl p-5";

    const user = document.createElement("p");
    user.className =
      "text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3";
    user.textContent = `User ${post.userId}`;

    const title = document.createElement("h3");
    title.className = "text-lg font-semibold text-slate-900 mb-3";
    title.textContent = post.title;

    const body = document.createElement("p");
    body.className = "text-sm text-slate-600 leading-6 mb-5";
    body.textContent = post.body;

    const actions = document.createElement("div");
    actions.className = "flex gap-3";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className =
      "text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50";

    editButton.addEventListener("click", () => editPost(post));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete post";
    deleteButton.className =
      "text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50";

    deleteButton.addEventListener("click", () => {
      deletePost(post.id, deleteButton);
    });

    actions.append(editButton, deleteButton);
    card.append(user, title, body, actions);
    postsList.appendChild(card);
  });
}

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
    postsStatus.textContent = `Could not load posts: ${error.message}`;
  }
}

export function setupPostFilters() {
  const userFilter = document.querySelector("#user-filter");

  userFilter.addEventListener("change", (event) => {
    loadPosts(event.target.value === "all" ? null : event.target.value);
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

    if (newPost.title.length < 3) {
      formStatus.textContent =
        "Title must contain at least 3 characters.";
      return;
    }

    if (newPost.body.length < 10) {
      formStatus.textContent =
        "Post content must contain at least 10 characters.";
      return;
    }

    if (newPost.title.length > 100 || newPost.body.length > 1000) {
      formStatus.textContent =
        "Your title or content exceeds the allowed length.";
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

// Edit a post
async function editPost(post) {
  const newTitle = window.prompt("Edit post title:", post.title);

  if (newTitle === null || !newTitle.trim()) return;

  const newBody = window.prompt("Edit post content:", post.body);

  if (newBody === null || !newBody.trim()) return;

  const postsStatus = document.querySelector("#posts-status");

  try {
    postsStatus.textContent = "Updating post...";

    const updatedPost = await api.patch(`/posts/${post.id}`, {
      title: newTitle.trim(),
      body: newBody.trim(),
    });

    posts = posts.map((item) =>
      item.id === post.id
        ? { ...item, ...updatedPost }
        : item
    );

    renderPosts();
    postsStatus.textContent =
      `Showing ${posts.length} posts. Post updated successfully!`;
  } catch (error) {
    postsStatus.textContent = `Could not update post: ${error.message}`;
  }
}

// Delete a post
async function deletePost(postId, button) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this post?"
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Deleting...";

  try {
    await api.del(`/posts/${postId}`);

    posts = posts.filter((post) => post.id !== postId);
    renderPosts();

    document.querySelector("#posts-status").textContent =
      posts.length === 0
        ? "No posts found."
        : `Showing ${posts.length} posts`;
  } catch (error) {
    button.disabled = false;
    button.textContent = "Delete post";

    document.querySelector("#posts-status").textContent =
      `Could not delete post: ${error.message}`;
  }
}
