
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center mt-16">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
            </div>

            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                Page Not Found
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>

            <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
                <Home className="w-4 h-4" />
                Go Home
            </Link>
        </div>
    );
};

export default NotFoundPage;
