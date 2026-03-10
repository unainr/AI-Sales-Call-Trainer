import { MainHeader } from "@/components/layouts/main-header"
import { LayoutType } from "@/types"

const Layout = ({children}:LayoutType) => {
  return (
    <>
    <MainHeader/>
    {children}
    </>
  )
}

export default Layout
