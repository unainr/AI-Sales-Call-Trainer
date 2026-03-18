import { MainHeader } from "@/components/layouts/main-header"
import { Footer } from "@/modules/home/ui/components/footer"
import { LayoutType } from "@/types"

const Layout = ({children}:LayoutType) => {
  return (
    <>
    <MainHeader/>
    {children}
   <Footer/>

    </>
  )
}

export default Layout
