import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("signin", "./routes/signin.tsx"),
  route("login", "./routes/login.tsx"),
  route("games", "./routes/games.tsx"),
  route("roundtable", "./routes/roundtable.tsx"),
  route("merch", "./routes/merch.tsx"),
  route("videos", "./routes/videos.tsx"),
  route("profile", "./routes/profile.tsx"),

  ...prefix("blog", [
    layout("./routes/blog.tsx", [
      index("./routes/blog._index.tsx"),
      route(":slug", "./routes/blog.$slug.tsx"),
    ]),
  ]),

  route("api/auth/signin", "./routes/api.auth.signin.ts"),
  route("api/auth/signout", "./routes/api.auth.signout.ts"),

  route("*", "./routes/$.tsx"),
] satisfies RouteConfig;
