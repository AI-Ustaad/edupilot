18:31:50.730 Running build in Washington, D.C., USA (East) – iad1
18:31:50.731 Build machine configuration: 2 cores, 8 GB
18:31:50.865 Cloning github.com/AI-Ustaad/edupilot (Branch: main, Commit: 0a125da)
18:31:51.416 Cloning completed: 551.000ms
18:31:57.229 Restored build cache from previous deployment (9ixiYQrEc4SdachdMe4FSpcC9C7U)
18:31:57.483 Running "vercel build"
18:31:57.500 Vercel CLI 54.14.0
18:31:57.876 Installing dependencies...
18:32:00.427 
18:32:00.428 up to date in 2s
18:32:00.428 
18:32:00.429 284 packages are looking for funding
18:32:00.429   run `npm fund` for details
18:32:00.464 Detected Next.js version: 14.2.3
18:32:00.472 Running "npm run build"
18:32:00.573 
18:32:00.574 > edupilot@0.1.0 build
18:32:00.574 > next build
18:32:00.574 
18:32:01.348   ▲ Next.js 14.2.3
18:32:01.349 
18:32:01.376    Creating an optimized production build ...
18:32:23.856  ⚠ Compiled with warnings
18:32:23.856 
18:32:23.856 ./node_modules/require-in-the-middle/index.js
18:32:23.856 Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
18:32:23.856 
18:32:23.856 Import trace for requested module:
18:32:23.857 ./node_modules/require-in-the-middle/index.js
18:32:23.857 ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
18:32:23.857 ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/index.js
18:32:23.857 ./node_modules/@opentelemetry/instrumentation/build/esm/platform/index.js
18:32:23.857 ./node_modules/@opentelemetry/instrumentation/build/esm/index.js
18:32:23.857 ./node_modules/@sentry/node/build/cjs/integrations/tracing/express.js
18:32:23.857 ./node_modules/@sentry/node/build/cjs/index.js
18:32:23.857 ./node_modules/@sentry/nextjs/build/cjs/index.server.js
18:32:23.857 ./app/global-error.tsx
18:32:23.857 
18:32:23.858    Linting and checking validity of types ...
18:32:42.106 Failed to compile.
18:32:42.107 
18:32:42.107 ./app/(protected)/admin/buses/page.tsx:54:52
18:32:42.108 Type error: Property 'buses' does not exist on type '{ readonly students: { readonly view: "students.view"; readonly create: "students.create"; readonly update: "students.update"; readonly delete: "students.delete"; readonly manage: "students.manage"; }; ... 28 more ...; readonly subscriptions: { ...; }; }'.
18:32:42.108 
18:32:42.108   52 |
18:32:42.109   53 |       {/* 🛡️ Protected Add Form */}
18:32:42.109 > 54 |       <RequirePermission permissions={[PERMISSIONS.buses.create]}>
18:32:42.109      |                                                    ^
18:32:42.110   55 |         <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
18:32:42.110   56 |           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
18:32:42.111   57 |             <input placeholder="Bus Number *" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
18:32:42.260 Error: Command "npm run build" exited with 1
