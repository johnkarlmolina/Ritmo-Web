import React, { useEffect, useMemo, useState } from 'react'
// @ts-ignore - local JS client
import { supabase } from '../supabaseClient'

export type ForgotPasswordProps = {
	onBackToLogin?: () => void
}

// This component handles both steps:
// 1) Request reset link by email
// 2) After clicking the email link (recovery), update the password
const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const [newPwd, setNewPwd] = useState('')
	const [confirmPwd, setConfirmPwd] = useState('')
	const [showPwd, setShowPwd] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	// Determine if we are in recovery mode based on URL or auth event
	const urlSearch = useMemo(() => new URLSearchParams(window.location.search), [])
	const urlHash = useMemo(() => new URLSearchParams(window.location.hash.replace(/^#/, '')), [])
	const hashType = urlHash.get('type')
	const queryType = urlSearch.get('type')
	const [isRecovery, setIsRecovery] = useState<boolean>(hashType === 'recovery' || queryType === 'recovery')

	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event: string) => {
			if (event === 'PASSWORD_RECOVERY') {
				setIsRecovery(true)
			}
		})
		return () => sub?.subscription?.unsubscribe?.()
	}, [])

	const handleSendLink = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setMessage(null)
		if (!email) {
			setError('Please enter your email.')
			return
		}
		setLoading(true)
		try {
			const redirectTo = window.location.href.split('#')[0]
			const { error: rpError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
			setLoading(false)
			if (rpError) {
				setError(rpError.message)
				return
			}
			setMessage('We sent a password reset link to your email. Please check your inbox.')
		} catch (e: any) {
			setLoading(false)
			setError(e?.message || 'Something went wrong. Please try again.')
		}
	}

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setMessage(null)
		if (!newPwd || !confirmPwd) {
			setError('Please fill out both fields.')
			return
		}
		if (newPwd !== confirmPwd) {
			setError('Passwords do not match.')
			return
		}
		if (newPwd.length < 6) {
			setError('Password must be at least 6 characters long.')
			return
		}
		setLoading(true)
		try {
			const { error: upErr } = await supabase.auth.updateUser({ password: newPwd })
			setLoading(false)
			if (upErr) {
				setError(upErr.message)
				return
			}
			setMessage('Password updated successfully. You can now log in with your new password.')
		} catch (e: any) {
			setLoading(false)
			setError(e?.message || 'Could not update password. Please try again.')
		}
	}

	if (isRecovery) {
		// Step 2: Create a New Password (matches the provided mock)
		return (
			<div>
				<h2 className="text-center text-2xl font-semibold text-slate-900 mb-2">Create a New Password</h2>
				<p className="text-center text-slate-700 mb-6">
					Enter your new password below to reset your account.
				</p>

				<form onSubmit={handleUpdatePassword} className="space-y-4">
					<div>
						<label className="block text-base text-slate-800 mb-1">New Password:</label>
						<div className="relative">
							<input
								className="w-full pr-12 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
								type={showPwd ? 'text' : 'password'}
								value={newPwd}
								onChange={(e) => setNewPwd(e.target.value)}
								placeholder="Enter new password"
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
						<label className="block text-base text-slate-800 mb-1">Confirm Password:</label>
						<div className="relative">
							<input
								className="w-full pr-12 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
								type={showConfirm ? 'text' : 'password'}
								value={confirmPwd}
								onChange={(e) => setConfirmPwd(e.target.value)}
								placeholder="Confirm new password"
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
						className="w-full py-3 px-4 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-semibold shadow disabled:opacity-60"
					>
						{loading ? 'Updating…' : 'Update Password'}
					</button>
				</form>

				<div className="mt-4 text-center">
					<button type="button" onClick={onBackToLogin} className="text-teal-700 hover:text-teal-600 underline">
						Back to Login
					</button>
				</div>
			</div>
		)
	}

	// Step 1: Request reset link
	return (
		<div>
			<h2 className="text-center text-2xl font-semibold text-slate-900 mb-2">Reset Password</h2>
			<p className="text-center text-slate-700 mb-6">
				Enter your email address and we’ll send you a link to reset your password.
			</p>
			<form onSubmit={handleSendLink} className="space-y-4">
				<div>
					<label className="block text-sm text-slate-800 mb-1">Email:</label>
					<input
						className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email here"
						autoComplete="email"
						required
					/>
				</div>

				{error && <div className="text-red-500 text-sm">{error}</div>}
				{message && <div className="text-emerald-600 text-sm">{message}</div>}

				<button
					type="submit"
					disabled={loading}
					className="w-full py-3 px-4 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-semibold shadow disabled:opacity-60"
				>
					{loading ? 'Sending…' : 'Send Reset Link'}
				</button>
			</form>

			<div className="mt-4 text-center">
				<button type="button" onClick={onBackToLogin} className="text-teal-700 hover:text-teal-600 underline">
					Back to Login
				</button>
			</div>
		</div>
	)
}

export default ForgotPassword

