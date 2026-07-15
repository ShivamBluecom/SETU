import { redirect } from 'next/navigation'

export default function Home() {
  redirect(process.env.DISABLE_DASHBOARD === 'true' ? '/opportunities' : '/dashboard')
}
