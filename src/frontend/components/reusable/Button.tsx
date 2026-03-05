import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = {
    label: string
    title: string
    type?: 'submit' | string
    onClick?: () => void
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button = ({ label, title, type, onClick, ...props }: ButtonProps) => {
    return (
        <div className="flex w-full items-center justify-center">
            <button
                type={type}
                className="text-letter-dark bg-primary mt-1 mb-1 w-1/2 scale-105 cursor-pointer rounded-md p-2 text-sm font-semibold transition-all duration-300 hover:scale-102 active:scale-95 lg:text-base"
                onClick={onClick}
                aria-label={label}
                {...props}
            >
                {title}
            </button>
        </div>
    )
}

export default Button
