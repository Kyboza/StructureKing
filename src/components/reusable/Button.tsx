
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = {
  label: string;
  title: string;
  type?: "submit" | string // default blir "submit" i komponenten
  onClick?: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ label, title, type, onClick, ...props }: ButtonProps) => {
  return (
    <div className='flex w-full items-center justify-center'>
    <button type={type} 
      className='text-letter-dark bg-primary hover:scale-102 p-2 rounded-md cursor-pointer active:scale-95 scale-105 transition-all duration-300 w-1/2 mt-1 mb-1 text-sm lg:text-base font-semibold' 
      onClick={onClick} aria-label={label} {...props}>
      {title}
    </button>
    </div>
  );
};

export default Button;