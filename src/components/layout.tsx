import type { PropsWithChildren } from 'react'

const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex justify-center h-screen">
      <div className="h-full w-full md:max-w-2xl border-x border-slate-400 overflow-y-scroll">
        {props.children}
      </div>
    </main>
  )
}

export default PageLayout;