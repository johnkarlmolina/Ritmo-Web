import React, { useMemo, useState } from "react";

type Topic = {
	key: string
	label: string
	query: string
	duration?: string
	views?: string
	category: 'speech' | 'social' | 'sensory' | 'learning' | 'music' | 'routine'
	description?: string
	thumb?: string
}

const Media: React.FC = () => {
	const [q, setQ] = useState("")
	const [open, setOpen] = useState(false)
	const [embedUrl, setEmbedUrl] = useState<string | null>(null)
	const [embedTitle, setEmbedTitle] = useState<string | null>(null)
	const [embedDescription, setEmbedDescription] = useState<string | null>(null)
	const [hovered, setHovered] = useState<string | null>(null)
	const [selectedCategory, setSelectedCategory] = useState<string>('all')

	const categoryColors = {
		speech: 'bg-blue-500',
		social: 'bg-purple-500',
		sensory: 'bg-green-500',
		learning: 'bg-orange-500',
		music: 'bg-pink-500',
		routine: 'bg-teal-500'
	}

	const categoryLabels = {
		speech: 'Speech & Language',
		social: 'Social Skills',
		sensory: 'Sensory Activities',
		learning: 'Learning & ABCs',
		music: 'Music & Songs',
		routine: 'Daily Routines'
	}

	// Curated educational content for children with autism - Miss Rachel and similar creators
	const topics = useMemo<Topic[]>(
		() => [
			{ 
				key: "first-words", 
				label: "First Words for Toddlers", 
				query: "Miss Rachel first words",
				duration: "25:30",
				views: "12M",
				category: 'speech',
				description: "Learn first words with Miss Rachel - perfect for speech development"
			},
			{ 
				key: "nursery", 
				label: "Nursery Rhymes & Songs", 
				query: "Miss Rachel nursery rhymes",
				duration: "18:45",
				views: "8.5M",
				category: 'music',
				description: "Classic nursery rhymes to help with language and rhythm"
			},
			{ 
				key: "abc", 
				label: "ABC & Phonics Fun", 
				query: "Miss Rachel ABC phonics",
				duration: "22:15",
				views: "15M",
				category: 'learning',
				description: "Interactive phonics and alphabet learning"
			},
			{ 
				key: "colors", 
				label: "Learning Colors", 
				query: "Miss Rachel colors",
				duration: "15:20",
				views: "6.2M",
				category: 'learning',
				description: "Explore colors through songs and activities"
			},
			{ 
				key: "animals", 
				label: "Animal Sounds & Names", 
				query: "Miss Rachel animals",
				duration: "20:10",
				views: "9.8M",
				category: 'learning',
				description: "Learn animal names and sounds with fun activities"
			},
			{ 
				key: "counting", 
				label: "Counting & Numbers", 
				query: "Miss Rachel counting numbers",
				duration: "19:30",
				views: "7.3M",
				category: 'learning',
				description: "Practice counting from 1-20 with engaging visuals"
			},
			{ 
				key: "bedtime", 
				label: "Calming Bedtime Songs", 
				query: "Miss Rachel bedtime songs",
				duration: "30:00",
				views: "11M",
				category: 'routine',
				description: "Soothing songs for bedtime routine"
			},
			{ 
				key: "speech", 
				label: "Speech Practice Activities", 
				query: "Miss Rachel speech practice",
				duration: "28:45",
				views: "5.9M",
				category: 'speech',
				description: "Targeted speech therapy exercises and activities"
			},
			{ 
				key: "songs", 
				label: "Baby Songs Collection", 
				query: "Miss Rachel baby songs",
				duration: "35:20",
				views: "13M",
				category: 'music',
				description: "Collection of educational songs for babies and toddlers"
			},
			{ 
				key: "routines", 
				label: "Daily Routines", 
				query: "Miss Rachel routines",
				duration: "16:40",
				views: "4.7M",
				category: 'routine',
				description: "Learn morning, mealtime, and daily routines"
			},
			{ 
				key: "social-skills", 
				label: "Social Skills & Emotions", 
				query: "autism social skills children emotions",
				duration: "24:15",
				views: "3.2M",
				category: 'social',
				description: "Understanding emotions and social interactions"
			},
			{ 
				key: "sensory-play", 
				label: "Sensory Play Activities", 
				query: "autism sensory activities children",
				duration: "21:30",
				views: "2.8M",
				category: 'sensory',
				description: "Calming sensory activities and exercises"
			},
			{ 
				key: "turn-taking", 
				label: "Turn Taking & Sharing", 
				query: "children turn taking sharing activities",
				duration: "17:50",
				views: "2.1M",
				category: 'social',
				description: "Learn to take turns and share with others"
			},
			{ 
				key: "visual-schedule", 
				label: "Visual Schedules & Structure", 
				query: "autism visual schedule children routine",
				duration: "14:25",
				views: "1.9M",
				category: 'routine',
				description: "Using visual schedules for daily structure"
			},
			{ 
				key: "communication", 
				label: "Communication Techniques", 
				query: "autism communication children nonverbal",
				duration: "26:10",
				views: "3.5M",
				category: 'speech',
				description: "Alternative communication methods and techniques"
			},
			{ 
				key: "calming", 
				label: "Calming Techniques", 
				query: "autism calming strategies children sensory",
				duration: "18:20",
				views: "2.6M",
				category: 'sensory',
				description: "Self-regulation and calming strategies"
			},
		],
		[]
	)

	const filtered = useMemo(() => {
		const t = q.trim().toLowerCase()
		let result = topics
		
		// Filter by category
		if (selectedCategory !== 'all') {
			result = result.filter(x => x.category === selectedCategory)
		}
		
		// Filter by search query
		if (t) {
			result = result.filter((x) => 
				x.label.toLowerCase().includes(t) || 
				x.query.toLowerCase().includes(t) ||
				x.description?.toLowerCase().includes(t)
			)
		}
		
		return result
	}, [q, topics, selectedCategory])

	function buildEmbed(input: string): { url: string; title: string } {
		const s = input.trim()
		// Detect playlist via list= parameter
		const listMatch = s.match(/[?&]list=([a-zA-Z0-9_-]+)/i) || s.match(/\/playlist\?list=([a-zA-Z0-9_-]+)/i)
		if (listMatch) {
			const id = listMatch[1]
			return {
				url: `https://www.youtube.com/embed/videoseries?list=${id}&autoplay=1&rel=0&modestbranding=1`,
				title: `Playlist: ${id}`,
			}
		}

		// Detect direct video id via v= or youtu.be/ID
		const vParam = s.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
		const youtuShort = s.match(/https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{6,})/i)
		const videoId = (vParam && vParam[1]) || (youtuShort && youtuShort[1])
		if (videoId) {
			return {
				url: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
				title: `Video: ${videoId}`,
			}
		}

		// Fallback: search-based playlist (may be unavailable depending on YouTube policy)
		const query = s.toLowerCase().includes("miss rachel") ? s : `Miss Rachel ${s}`
		return {
			url: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1&rel=0&modestbranding=1`,
			title: query,
		}
	}

	function playSearch(input: string, description?: string) {
		const { url, title } = buildEmbed(input)
		setEmbedUrl(url)
		setEmbedTitle(title)
		setEmbedDescription(description || null)
		setOpen(true)
	}

		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
				<div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
					
					{/* Modern Header with Animated Title */}
					<div className="mb-8">
						<h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#2D7778] via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-[gradient_3s_ease_infinite] bg-[length:200%_auto]">
							Educational Media Hub
						</h1>
						<p className="text-slate-600 text-lg">
							Discover engaging content from Miss Rachel and autism-friendly educational videos
						</p>
					</div>

					{/* Modern Search Bar */}
					<div className="mb-6 flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<input
								value={q}
								onChange={(e) => setQ(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && q.trim()) {
										playSearch(q.trim())
									}
								}}
								placeholder="Search for educational videos, Miss Rachel, autism resources..."
								className="w-full h-14 pl-12 pr-24 rounded-full bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 border-2 border-slate-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2D7778] focus:border-transparent transition-all duration-300"
							/>
							{q && (
								<button
									onClick={() => setQ("")}
									className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
							<button
								onClick={() => q.trim() && playSearch(q.trim())}
								className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-full bg-gradient-to-r from-[#2D7778] to-[#3a9c9e] hover:from-[#2f8485] hover:to-[#42b0b3] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
							>
								Search
							</button>
						</div>
					</div>

					{/* Category Filter Pills */}
					<div className="mb-8 flex flex-wrap gap-2">
						<button
							onClick={() => setSelectedCategory('all')}
							className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
								selectedCategory === 'all'
									? 'bg-gradient-to-r from-[#2D7778] to-[#3a9c9e] text-white shadow-lg'
									: 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
							}`}
						>
							All Videos
						</button>
						{Object.entries(categoryLabels).map(([key, label]) => (
							<button
								key={key}
								onClick={() => setSelectedCategory(key)}
								className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
									selectedCategory === key
										? `${categoryColors[key as keyof typeof categoryColors]} text-white shadow-lg`
										: 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
								}`}
							>
								<span className={`w-2 h-2 rounded-full ${selectedCategory === key ? 'bg-white' : categoryColors[key as keyof typeof categoryColors]}`} />
								{label}
							</button>
						))}
					</div>

					{/* Video Grid with Modern Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filtered.map((t) => (
							<button
								key={t.key}
								onClick={() => playSearch(t.query, t.description)}
								onMouseEnter={() => setHovered(t.key)}
								onMouseLeave={() => setHovered(null)}
								className="group text-left bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
							>
								{/* Thumbnail */}
								<div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden">
									{t.thumb ? (
										<img 
											src={t.thumb} 
											alt={t.label} 
											className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
											onError={(e) => { e.currentTarget.style.display = 'none' }} 
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="text-white/30 text-6xl">📺</div>
										</div>
									)}
									
									{/* Gradient Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									
									{/* Duration Badge */}
									{t.duration && (
										<div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded backdrop-blur-sm">
											{t.duration}
										</div>
									)}
									
									{/* Play Button */}
									<div className="absolute inset-0 flex items-center justify-center">
										<div className={`w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transition-all duration-300 ${
											hovered === t.key ? 'scale-110 bg-[#2D7778]' : 'scale-100'
										}`}>
											<svg className={`w-8 h-8 ml-1 transition-colors duration-300 ${hovered === t.key ? 'text-white' : 'text-[#2D7778]'}`} fill="currentColor" viewBox="0 0 24 24">
												<path d="M8 5v14l11-7z" />
											</svg>
										</div>
									</div>
									
									{/* Category Badge */}
									<div className={`absolute top-2 left-2 px-3 py-1 ${categoryColors[t.category]} text-white text-xs font-semibold rounded-full shadow-lg`}>
										{categoryLabels[t.category]}
									</div>
								</div>

								{/* Card Content */}
								<div className="p-4">
									<h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#2D7778] transition-colors">
										{t.label}
									</h3>
									{t.description && (
										<p className="text-slate-600 text-sm line-clamp-2 mb-3">
											{t.description}
										</p>
									)}
									<div className="flex items-center gap-3 text-xs text-slate-500">
										{t.views && (
											<span className="flex items-center gap-1">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
												{t.views} views
											</span>
										)}
									</div>
								</div>
							</button>
						))}
					</div>

					{/* No Results */}
					{filtered.length === 0 && (
						<div className="text-center py-20">
							<div className="text-6xl mb-4">🔍</div>
							<h3 className="text-2xl font-semibold text-slate-700 mb-2">No videos found</h3>
							<p className="text-slate-500">Try adjusting your search or filters</p>
						</div>
					)}

				{/* Enhanced Video Modal */}
				{open && embedUrl && (
					<div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm">
						<div className="h-full w-full flex flex-col items-center justify-center p-4">
							
							{/* Close Button */}
							<button
								onClick={() => setOpen(false)}
								className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-md"
								aria-label="Close"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

							{/* Video Player Container */}
							<div className="w-full max-w-6xl">
								<div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
									<iframe
										className="w-full h-full"
										src={embedUrl || ''}
										title={embedTitle ?? 'Educational Video'}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										loading="lazy"
										allowFullScreen
									/>
								</div>

								{/* Video Info */}
								{embedDescription && (
									<div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
										<h2 className="text-2xl font-bold mb-2">{embedTitle}</h2>
										<p className="text-white/80 leading-relaxed">{embedDescription}</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Media;
