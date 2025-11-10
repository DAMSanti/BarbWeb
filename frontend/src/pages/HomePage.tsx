import { useAppStore } from '../store/appStore'
import ClassicLayout from '../layouts/ClassicLayout'
import MinimalistLayout from '../layouts/MinimalistLayout'
import StyleSwitcher from '../components/StyleSwitcher'

export default function HomePage() {
  const { layout } = useAppStore()

  const renderLayout = () => {
    switch (layout) {
      case 'minimalist':
        return <MinimalistLayout />
      case 'classic':
      default:
        return <ClassicLayout />
    }
  }

  return (
    <>
      <StyleSwitcher />
      {renderLayout()}
    </>
  )
}
