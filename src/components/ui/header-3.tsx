'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
	Layers,
	Smartphone,
	Headphones,
	Sparkles,
	Printer,
	Calculator,
	QrCode,
	Monitor,
	BookOpen,
	ShieldCheck,
	Clock,
	Sun,
	Moon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


type LinkItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
};

export function Header({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b transition-all duration-500 overflow-hidden', {
				'bg-[#030303] border-white/[0.06] py-2': scrolled && theme === 'dark',
				'bg-[#f8fafc] border-slate-200/40 shadow-sm py-2': scrolled && theme === 'light',
				'bg-transparent border-transparent py-4': !scrolled,
			})}
		>
			{/* High-end 100% performance-free gold/orange cosmic gradient navbar background */}
			{scrolled && (
				<div 
					className={cn(
						"absolute inset-0 pointer-events-none transition-all duration-500 z-0",
						theme === 'dark' 
							? "bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.12),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(251,191,36,0.08),transparent_60%)] bg-[#030303]" 
							: "bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.06),transparent_40%),radial-gradient(circle_at_70%_50%,rgba(251,191,36,0.04),transparent_50%)] bg-[#f8fafc]"
					)}
				/>
			)}
			<nav className="relative z-10 mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
				<div className="flex items-center gap-6">
					<a href="#" className="flex items-center gap-2 hover:opacity-90 font-bold tracking-wide">
						<Layers className="size-6 text-blue-500 animate-pulse-slow" />
						<span className={cn(theme === 'light' ? 'text-slate-800' : 'text-white', 'text-base font-bold')}>
							OMNIHUB <span className="text-blue-500 font-mono text-xs">3D</span>
						</span>
					</a>
					
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							{/* Showroom Menu */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className={cn("bg-transparent", theme === 'light' ? 'text-slate-700 hover:text-black hover:bg-slate-100/50' : 'text-gray-300 hover:text-white')}>
									Showroom
								</NavigationMenuTrigger>
								<NavigationMenuContent className={cn(theme === 'light' ? 'bg-white/95 border-slate-200/80 shadow-2xl' : 'bg-black/95 border-white/10 shadow-2xl', 'p-2 rounded-2xl backdrop-blur-xl')}>
									<ul className="grid w-[480px] grid-cols-2 gap-2 p-2">
										{showroomLinks.map((item, i) => (
											<li key={i}>
												<ListItem {...item} theme={theme} />
											</li>
										))}
									</ul>
									<div className={cn(theme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-white/[0.02]', 'p-2.5 border-t mt-1 rounded-b-xl')}>
										<p className="text-gray-500 dark:text-gray-400 text-xs flex items-center justify-between">
											<span>Looking for a dynamic model check?</span>
											<a href="#showroom" className="text-blue-500 font-semibold hover:underline flex items-center gap-1">
												Enter Color Configurator &rarr;
											</a>
										</p>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							
							{/* Service Desk Menu */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className={cn("bg-transparent", theme === 'light' ? 'text-slate-700 hover:text-black hover:bg-slate-100/50' : 'text-gray-300 hover:text-white')}>
									Services
								</NavigationMenuTrigger>
								<NavigationMenuContent className={cn(theme === 'light' ? 'bg-white/95 border-slate-200/80 shadow-2xl' : 'bg-black/95 border-white/10 shadow-2xl', 'p-2 rounded-2xl backdrop-blur-xl')}>
									<div className="grid w-[540px] grid-cols-2 gap-2">
										<ul className="space-y-1 p-2">
											<span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider pl-2 block mb-1">Sector B: Cloud Print</span>
											{printLinks.map((item, i) => (
												<li key={i}>
													<ListItem {...item} theme={theme} />
												</li>
											))}
										</ul>
										<ul className="space-y-1 p-2 bg-white/[0.01] border-l border-white/5">
											<span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider pl-2 block mb-1">Sector C: Cyber Terminal</span>
											{cyberLinks.map((item, i) => (
												<li key={i}>
													<ListItem {...item} theme={theme} />
												</li>
											))}
										</ul>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							
							<NavigationMenuLink asChild>
								<a href="#about" className={cn(theme === 'light' ? 'text-slate-600 hover:text-black' : 'text-gray-300 hover:text-white', 'px-4 py-2 text-sm font-medium transition-colors')}>
									About Shop
								</a>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				
				<div className="hidden items-center gap-3 md:flex">
					{/* Theme Switcher Button */}
					<Button variant="ghost" size="icon" onClick={toggleTheme} className={cn("rounded-full h-9 w-9", theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-gray-300')} aria-label="Toggle theme">
						{theme === 'light' ? <Moon className="size-5 text-indigo-600" /> : <Sun className="size-5 text-amber-400" />}
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a href="#printdesk">Print Kiosk</a>
					</Button>
					<Button size="sm" asChild>
						<a href="#cyberconsole">Book PC Slot</a>
					</Button>
				</div>
				
				<div className="flex items-center gap-2 md:hidden">
					<Button variant="ghost" size="icon" onClick={toggleTheme} className={cn("rounded-full h-9 w-9", theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-gray-300')} aria-label="Toggle theme">
						{theme === 'light' ? <Moon className="size-5 text-indigo-600" /> : <Sun className="size-5 text-amber-400" />}
					</Button>
					<Button
						size="icon"
						variant="outline"
						onClick={() => setOpen(!open)}
						aria-expanded={open}
						aria-controls="mobile-menu"
						aria-label="Toggle menu"
					>
						<MenuToggleIcon open={open} className="size-5" duration={300} />
					</Button>
				</div>
			</nav>
			
			<MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
				<NavigationMenu className="max-w-full w-full">
					<div className="flex w-full flex-col gap-y-4">
						<div>
							<span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Showroom</span>
							<div className="flex flex-col gap-1">
								{showroomLinks.map((link) => (
									<ListItem key={link.title} {...link} onClick={() => setOpen(false)} />
								))}
							</div>
						</div>
						<div>
							<span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Cloud Print & Cyber Desk</span>
							<div className="flex flex-col gap-1">
								{printLinks.map((link) => (
									<ListItem key={link.title} {...link} onClick={() => setOpen(false)} />
								))}
								{cyberLinks.map((link) => (
									<ListItem key={link.title} {...link} onClick={() => setOpen(false)} />
								))}
							</div>
						</div>
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-2 mt-6">
					<Button variant="outline" className="w-full" onClick={() => setOpen(false)} asChild>
						<a href="#printdesk">Cloud Print</a>
					</Button>
					<Button className="w-full" onClick={() => setOpen(false)} asChild>
						<a href="#cyberconsole">Terminal Matrix</a>
					</Button>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className="bg-black/95 backdrop-blur-2xl fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-t border-white/5 md:hidden"
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 ease-out size-full p-6',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

interface ListItemProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuLink> {
	title: string;
	description?: string;
	icon: LucideIcon;
	href: string;
	theme?: 'light' | 'dark';
}

function ListItem({
	title,
	description,
	icon: Icon,
	className,
	href,
	onClick,
	theme = 'dark',
	...props
}: ListItemProps) {
	return (
		<NavigationMenuLink className={cn('w-full flex gap-3 rounded-xl p-2.5 transition-all duration-200 group', theme === 'light' ? 'hover:bg-slate-100 focus:bg-slate-100' : 'hover:bg-white/5 focus:bg-white/5', className)} {...props} asChild>
			<a href={href} onClick={onClick}>
				<div className={cn(theme === 'light' ? 'bg-slate-50 border-slate-200/65 group-hover:bg-blue-500/10 group-hover:border-blue-500/20' : 'bg-white/5 border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20', 'flex aspect-square size-10 items-center justify-center rounded-lg shadow-sm transition-all border')}>
					<Icon className={cn(theme === 'light' ? 'text-slate-600 group-hover:text-blue-500' : 'text-gray-300 group-hover:text-blue-400', 'size-5 transition-colors')} />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className={cn(theme === 'light' ? 'text-slate-800 group-hover:text-black font-semibold' : 'text-gray-200 group-hover:text-white font-medium', 'text-sm transition-colors')}>{title}</span>
					{description && <span className={cn(theme === 'light' ? 'text-slate-500' : 'text-gray-400', 'text-xs mt-0.5 line-clamp-1')}>{description}</span>}
				</div>
			</a>
		</NavigationMenuLink>
	);
}

const showroomLinks: LinkItem[] = [
	{
		title: 'Device Showroom',
		href: '#showroom',
		description: 'Float custom 3D smartphone simulator',
		icon: Smartphone,
	},
	{
		title: 'Tech Accessories',
		href: '#showroom',
		description: 'High-end cyber tech gear catalog',
		icon: Headphones,
	},
	{
		title: 'Real-time Stock',
		href: '#showroom',
		description: 'Live availability checker before order',
		icon: Sparkles,
	},
	{
		title: 'Express WhatsApp Checkout',
		href: '#showroom',
		description: 'Instant WhatsApp integration checkout',
		icon: Clock,
	},
];

const printLinks: LinkItem[] = [
	{
		title: 'Quick Xerox Engine',
		href: '#printdesk',
		description: 'Step-by-step PDF/PNG files upload desk',
		icon: Printer,
	},
	{
		title: 'Cost Calculator',
		href: '#printdesk',
		description: 'Estimate by size, side options, lamination',
		icon: Calculator,
	},
	{
		title: 'Express Counter QR',
		href: '#printdesk',
		description: 'Express code generation to pick up files',
		icon: QrCode,
	},
];

const cyberLinks: LinkItem[] = [
	{
		title: 'High-Speed Terminals',
		href: '#cyberconsole',
		description: 'Matrix booking console grid for PC stations',
		icon: Monitor,
	},
	{
		title: 'Form Application Desk',
		href: '#cyberconsole',
		description: 'Job, Admissions, Passport form bookings',
		icon: BookOpen,
	},
	{
		title: 'Secure Upload',
		href: '#cyberconsole',
		description: 'Upload identification sheets instantly',
		icon: ShieldCheck,
	},
];

function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}
