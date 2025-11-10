import { useAppStore } from '../store/appStore'
import ClassicLayout from '../layouts/ClassicLayout'
import MinimalistLayout from '../layouts/MinimalistLayout'
import PremiumLayout from '../layouts/PremiumLayout'
import LayoutSwitcher from '../components/LayoutSwitcher'

export default function HomePage() {
  const { layout } = useAppStore()

  const renderLayout = () => {
    switch (layout) {
      case 'minimalist':
        return <MinimalistLayout />
      case 'premium':
        return <PremiumLayout />
      case 'classic':
      default:
        return <ClassicLayout />
    }
  }

  return (
    <>
      <LayoutSwitcher />
      {renderLayout()}
    </>
  )
}
