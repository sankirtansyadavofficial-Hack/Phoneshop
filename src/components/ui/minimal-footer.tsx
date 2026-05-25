import { Layers } from 'lucide-react';

export function MinimalFooter() {
	const year = new Date().getFullYear();

	const company = [
		{
			title: 'Device Showroom',
			href: '#showroom',
		},
		{
			title: 'Cloud Print Desk',
			href: '#printdesk',
		},
		{
			title: 'Cyber Cafe Console',
			href: '#cyberconsole',
		},
		{
			title: 'Privacy Policy',
			href: '#',
		},
		{
			title: 'Terms of Service',
			href: '#',
		},
	];

	const resources = [
		{
			title: 'Xerox Cost Calculator',
			href: '#printdesk',
		},
		{
			title: 'PC Seat Booking',
			href: '#cyberconsole',
		},
		{
			title: 'Express WhatsApp Orders',
			href: '#showroom',
		},
		{
			title: 'Help Center & Support',
			href: '#',
		},
		{
			title: 'Cyber Security Desk',
			href: '#',
		},
	];

	const socialLinks = [
		{
			icon: (
				<svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
				</svg>
			),
			link: '#',
		},
		{
			icon: (
				<svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
					<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
				</svg>
			),
			link: '#',
		},
		{
			icon: (
				<svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
					<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
					<path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
				</svg>
			),
			link: '#',
		},
		{
			icon: (
				<svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
				</svg>
			),
			link: '#',
		},
		{
			icon: (
				<svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
			),
			link: '#',
		},
		{
			icon: (
				<svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
				</svg>
			),
			link: '#',
		},
	];
	return (
		<footer className="relative bg-black/30 border-t border-white/5 py-12">
			<div className="mx-auto max-w-5xl px-6">
				<div className="grid grid-cols-6 gap-8 p-4">
					<div className="col-span-6 flex flex-col gap-5 md:col-span-4">
						<a href="#" className="flex items-center gap-2 text-white font-bold tracking-wide">
							<Layers className="size-6 text-blue-500 animate-pulse-slow" />
							<span>PKG <span className="text-blue-500 font-mono text-xs">Shop</span></span>
						</a>
						<p className="text-gray-400 max-w-sm text-sm text-balance">
							Your one-stop phone accessories shop — smartphones, screen guards, headphones, chargers, cables, and Cloud Print & Cyber Terminal services.
						</p>
						<div className="flex gap-2">
							{socialLinks.map((item, i) => (
								<a
									key={i}
									className="hover:bg-white/10 text-gray-400 hover:text-white rounded-md border border-white/10 p-2 backdrop-blur-md transition-all duration-200"
									target="_blank"
									rel="noreferrer"
									href={item.link}
								>
									{item.icon}
								</a>
							))}
						</div>
					</div>
					
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-gray-400 mb-3 block text-xs uppercase font-semibold tracking-wider">
							Ecosystem
						</span>
						<div className="flex flex-col gap-2">
							{resources.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max text-sm text-gray-400 hover:text-white transition-colors duration-200 hover:underline"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
					
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-gray-400 mb-3 block text-xs uppercase font-semibold tracking-wider">
							Company
						</span>
						<div className="flex flex-col gap-2">
							{company.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max text-sm text-gray-400 hover:text-white transition-colors duration-200 hover:underline"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
				</div>
				
				<div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs">
					<p>© {year} PKG Shop. All rights reserved.</p>
					<div className="flex items-center gap-4 mt-2 md:mt-0">
						<a href="/admin" className="hover:text-white transition-colors duration-200 flex items-center gap-1.5">
							<svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
							<span>Admin Panel</span>
						</a>
						<p>Designed in Cyber-Minimalism.</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
