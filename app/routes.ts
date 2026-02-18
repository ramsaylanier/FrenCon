import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("signin", "./routes/signin.tsx"),
  route("signup", "./routes/signup.tsx"),
  route("login", "./routes/login.tsx"),
  route("games", "./routes/games.tsx"),
  route("polling", "./routes/polling.tsx"),
  route("roundtable", "./routes/roundtable.tsx"),
  route("ttrpg", "./routes/ttrpg.tsx"),
  route("merch", "./routes/merch.tsx"),
  route("videos", "./routes/videos.tsx"),
  route("profile", "./routes/profile.tsx"),

  layout("./routes/blog.tsx", [
    index("./routes/blog._index.tsx"),
    route(":slug", "./routes/blog.$slug.tsx"),
  ]),

  route("api/auth/signin", "./routes/api.auth.signin.ts"),
  route("api/auth/signout", "./routes/api.auth.signout.ts"),
  route("api/auth/register", "./routes/api.auth.register.ts"),
] satisfies RouteConfig;
