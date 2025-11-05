import React, { useState } from 'react'
// @ts-ignore - local JS client
import { supabase } from '../supabaseClient'

export type SignupFormProps = {
	onSuccess?: () => void
	onBackToLogin?: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [showPwd, setShowPwd] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setMessage(null)
		if (!email || !password || !confirm) {
			setError('Please fill out all fields.')
			return
		}
		if (password !== confirm) {
			setError('Passwords do not match.')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}
		setLoading(true)
		try {
			const { error: signErr } = await supabase.auth.signUp({ email, password })
			setLoading(false)
			if (signErr) {
				setError(signErr.message)
				return
			}
			setMessage('Check your email to confirm your account.')
			onSuccess?.()
		} catch (e: any) {
			setLoading(false)
			setError(e?.message || 'Sign up failed')
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm text-slate-800 mb-1">Email:</label>
				<input
					className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter email here"
					autoComplete="email"
					required
				/>
			</div>

			<div>
				<label className="block text-sm text-slate-800 mb-1">Password:</label>
				<div className="relative">
					<input
						className="w-full pr-12 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
						type={showPwd ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password here"
						autoComplete="new-password"
						required
					/>
					<button
						type="button"
						onClick={() => setShowPwd((s) => !s)}
						className="absolute inset-y-0 right-2 my-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
						aria-label={showPwd ? 'Hide password' : 'Show password'}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
					</button>
				</div>
			</div>

			<div>
				<label className="block text-sm text-slate-800 mb-1">Confirm Password</label>
				<div className="relative">
					<input
						className="w-full pr-12 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
						type={showConfirm ? 'text' : 'password'}
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						placeholder="Re – Enter password here"
						autoComplete="new-password"
						required
					/>
					<button
						type="button"
						onClick={() => setShowConfirm((s) => !s)}
						className="absolute inset-y-0 right-2 my-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
						aria-label={showConfirm ? 'Hide password' : 'Show password'}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
					</button>
				</div>
			</div>

			{error && <div className="text-red-500 text-sm">{error}</div>}
			{message && <div className="text-emerald-600 text-sm">{message}</div>}

			<button
				type="submit"
				disabled={loading}
				className="w-full py-2.5 px-4 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-medium shadow disabled:opacity-60"
			>
				{loading ? 'Creating…' : 'Sign up'}
			</button>
		</form>
	)
}

export default SignupForm
