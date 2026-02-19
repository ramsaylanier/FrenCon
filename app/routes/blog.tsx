import { Outlet } from "react-router";

export default function BlogLayout() {
  return <div className="h-full overflow-auto">
    <Outlet />
  </div>
}
