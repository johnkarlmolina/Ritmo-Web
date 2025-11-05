import React, { useState } from 'react'
// @ts-ignore - local JS client
import { supabase } from '../supabaseClient'

export type ResetPasswordProps = {
	onSent?: () => void
	onBackToLogin?: () => void
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSent, onBackToLogin }) => {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setMessage(null)
		if (!email) {
			setError('Please enter your email.')
			return
		}
		setLoading(true)
		try {
			const redirectTo = window.location.origin
			const { error: rpError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
			setLoading(false)
			if (rpError) {
				setError(rpError.message)
				return
			}
			setMessage('We just sent you a password reset link. Please check your email.')
			onSent?.()
		} catch (e: any) {
			setLoading(false)
			setError(e?.message || 'Something went wrong. Please try again.')
		}
	}

	return (
		<div>
			<p className="text-center text-slate-700 mb-6">
				Enter your email address and we'll send you a link to reset your password.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm text-slate-800 mb-1">Email:</label>
					<input
						className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email here:"
						autoComplete="email"
						required
					/>
				</div>

				{error && <div className="text-red-500 text-sm">{error}</div>}
				{message && <div className="text-emerald-600 text-sm">{message}</div>}

				<button
					type="submit"
					disabled={loading}
					className="w-full py-3 px-4 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-medium shadow disabled:opacity-60"
				>
					{loading ? 'Sending…' : 'Send Reset Link'}
				</button>
			</form>

			<div className="mt-4 text-center">
				<button
					type="button"
					onClick={onBackToLogin}
					className="text-teal-700 hover:text-teal-600 underline"
				>
					Back to Login
				</button>
			</div>
		</div>
	)
}

export default ResetPassword

