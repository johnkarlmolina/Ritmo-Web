import React, { useState } from "react";
import tailwindcss from "@tailwindcss/vite";
// supabaseClient.js is plain JS and doesn't ship types in this repo.
// @ts-ignore
import { supabase } from "../supabaseClient";

type Props = {
	onSuccess?: () => void;
};

const Login: React.FC<Props> = ({ onSuccess }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!email || !password) {
			setError("Please enter both email and password.");
			return;
		}

		setLoading(true);
		try {
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			setLoading(false);

			if (authError) {
				setError(authError.message);
				return;
			}

			if (onSuccess) onSuccess();
			else window.location.href = "/";
		} catch (err: any) {
			setLoading(false);
			setError(err?.message || String(err));
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="w-full max-w-md bg-white/5 p-8 rounded-lg shadow-lg">
				<h2 className="text-2xl font-semibold mb-4 text-white">Sign in</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm text-white/90 mb-1">Email</label>
						<input
							className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label className="block text-sm text-white/90 mb-1">Password</label>
						<input
							className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Your password"
						/>
					</div>

					{error && <div className="text-red-400 text-sm">{error}</div>}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="w-full py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>

				<div className="mt-4 text-sm text-white/80">
					Don't have an account? <a href="/signup" className="text-indigo-400">Sign up</a>
				</div>
				<div className="mt-2 text-sm text-white/80">
					<a href="/reset-password" className="text-indigo-400">Forgot password?</a>
				</div>
			</div>
		</div>
	);
};

export default Login;

