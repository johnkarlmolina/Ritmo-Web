import React, { useMemo, useRef, useState } from 'react'

type MediaItem = {
	id: string
	title: string
	channel: string
	views: string
	age: string
	src: string
	poster?: string
}

const sampleSrc = 'https://www.w3schools.com/html/mov_bbb.mp4'

const Media: React.FC = () => {
	const [query, setQuery] = useState('')
	const [hovered, setHovered] = useState<string | null>(null)

	// 16 items (4x4) – reuse the sample video; you can swap src/poster later
	const items: MediaItem[] = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
		id: `vid-${i + 1}`,
		title: `Sample Highlight ${i + 1}`,
		channel: 'The Scoreboard',
		views: `${(i + 1) * 8}K views`,
		age: `${i + 1} hours ago`,
		src: sampleSrc,
	})), [])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return items
		return items.filter(i =>
			i.title.toLowerCase().includes(q) ||
			i.channel.toLowerCase().includes(q)
		)
	}, [items, query])

	const handleHover = (id: string) => {
		setHovered(id)
	}
	const handleLeave = () => setHovered(null)

	const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		// Search just filters client-side in this basic version
	}

	return (
		<div className="text-white">
			{/* Search Bar */}
			<form onSubmit={onSubmit} className="mb-6 sm:mb-8">
				<label htmlFor="media-search" className="sr-only">Search media</label>
				<div className="flex items-center gap-2">
					<input
						id="media-search"
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search title or channel"
						className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
					/>
					<button
						type="submit"
						className="whitespace-nowrap rounded-2xl px-5 py-3 bg-teal-700 hover:bg-teal-600 text-white font-semibold shadow"
					>
						Search
					</button>
				</div>
			</form>

			{/* 4 x 4 Grid */}
			<div className="grid grid-cols-4 gap-4">
				{filtered.map((item) => (
					<MediaCard
						key={item.id}
						item={item}
						hovered={hovered === item.id}
						onHover={() => handleHover(item.id)}
						onLeave={handleLeave}
					/>
				))}
			</div>
		</div>
	)
}

const MediaCard: React.FC<{
	item: MediaItem
	hovered: boolean
	onHover: () => void
	onLeave: () => void
}> = ({ item, hovered, onHover, onLeave }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null)

	// Autoplay preview on hover, pause on leave
	const handleEnter = () => {
		onHover()
		const v = videoRef.current
		if (v) {
			v.muted = true
			v.currentTime = 0
			v.play().catch(() => {})
		}
	}
	const handleOut = () => {
		onLeave()
		const v = videoRef.current
		if (v) {
			v.pause()
			v.currentTime = 0
		}
	}

	return (
		<div
			className="group rounded-2xl overflow-hidden bg-white/10 border border-white/10 shadow hover:shadow-lg transition-shadow"
			onMouseEnter={handleEnter}
			onMouseLeave={handleOut}
		>
			{/* Video container */}
			<div className="relative aspect-video bg-black/70">
				<video
					ref={videoRef}
					controls={false}
					playsInline
					className="h-full w-full object-cover"
					poster={item.poster}
				>
					<source src={item.src} type="video/mp4" />
				</video>

				{/* Hover overlay */}
				<div className={`absolute inset-0 pointer-events-none transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
					<div className="absolute inset-0 bg-black/30" />
					<div className="absolute bottom-2 right-2 rounded-full bg-[#2D7778] text-white text-xs font-semibold px-3 py-1 shadow">
						Previewing
					</div>
				</div>
			</div>

			{/* Description */}
			<div className="p-3 bg-white text-slate-900">
				<div className="font-semibold leading-snug line-clamp-2">{item.title}</div>
				<div className="text-sm text-slate-600 mt-1">{item.channel}</div>
				<div className="text-xs text-slate-500 mt-0.5">{item.views} • {item.age}</div>
			</div>
		</div>
	)
}

export default Media
