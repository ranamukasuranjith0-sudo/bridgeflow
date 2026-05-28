import Topbar from '@/components/Topbar'
import RegisterScreen from '@/components/screens/RegisterScreen'

export default function RegisterPage() {
  return (
    <>
      <Topbar title="Nouvelle inscription" />
      <div className="content">
        <RegisterScreen />
      </div>
    </>
  )
}
