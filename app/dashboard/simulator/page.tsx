import Topbar from '@/components/Topbar'
import SimulatorScreen from '@/components/screens/SimulatorScreen'

export default function SimulatorPage() {
  return (
    <>
      <Topbar title="Simulateur TJM" />
      <div className="content">
        <SimulatorScreen />
      </div>
    </>
  )
}
