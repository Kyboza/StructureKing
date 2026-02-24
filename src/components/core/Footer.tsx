

const Footer = () => {
    const date: number = new Date().getFullYear()
  return (
    <footer className="flex flex-row items-start justify-start w-full h-25 p-2 ml-2 bg-primary border-t border-gray-500 shadow-footer">
        <p className="text-letter dark:text-letter-dark text-sm font-semibold">
        &copy; {date} Structure King. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer