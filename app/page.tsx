import nextDynamic from 'next/dynamic';

const LandingClient = nextDynamic(() => import('./LandingClient'), { 
  ssr: false 
});

export const dynamic = 'force-dynamic';

export default function Page() {
  return <LandingClient />;
}
