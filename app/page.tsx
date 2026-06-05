import dynamic from 'next/dynamic';

const LandingClient = dynamic(() => import('./LandingClient'), { 
  ssr: false 
});

export const dynamic = 'force-dynamic';

export default function Page() {
  return <LandingClient />;
}
