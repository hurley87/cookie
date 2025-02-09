import { supabaseService } from '@/lib/services/supabase';

// Revalidate every minute
export const revalidate = 60;

interface Tweet {
  id: string;
  content: string;
  created_at: string;
}

async function getTweets(): Promise<Tweet[]> {
  const { data: tweets, error } = await supabaseService
    .from('tweets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }

  return tweets as Tweet[];
}

export default async function TweetsPage() {
  const tweets = await getTweets();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    AI Market Analyst
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(tweet.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-gray-600 text-base whitespace-pre-wrap">
                {tweet.content}
              </div>

              <div className="mt-4 flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    tweet.content
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-500 transition-colors duration-200 flex items-center gap-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Post to X
                </a>
              </div>
            </div>
          </div>
        ))}

        {tweets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">No tweets found</p>
          </div>
        )}
      </div>
    </main>
  );
}
