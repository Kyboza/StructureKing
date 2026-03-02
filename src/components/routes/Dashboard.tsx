import { useAuthCheck } from "@/frontend-utils/useAuthCheck"

const Dashboard = () => {
  const authStatus = useAuthCheck({require:"User"});
  if (authStatus === null) return null;
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard