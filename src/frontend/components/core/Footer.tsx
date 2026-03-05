const Footer = () => {
    const date: number = new Date().getFullYear()
    return (
        <footer className="bg-primary shadow-footer flex h-25 w-full flex-row items-start justify-start border-t border-gray-500 p-2">
            <p className="text-letter dark:text-letter-dark mt-1 ml-2 text-sm font-semibold">
                &copy; {date} Structure King. All rights reserved.
            </p>
        </footer>
    )
}

export default Footer
