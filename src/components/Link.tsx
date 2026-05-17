export interface LinkProps {
  link: string;
  name: string;
}

export function Link({
  link,
  name,
}: LinkProps) {
  return (
    <a className='link' href={link} target='_blank'>{name}</a>
  )
}