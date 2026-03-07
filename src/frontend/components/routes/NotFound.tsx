import OuterContainer from '../reusable/OuterContainer'

const NotFound = () => {
    return (
        <OuterContainer>
            <div className='flex w-full h-full items-center justify-center'>
                <h1 className="mt-4 text-3xl font-bold md:text-5xl">
                    404 - Page Not Found
                </h1>
            </div>
        </OuterContainer>
    )
}

export default NotFound
