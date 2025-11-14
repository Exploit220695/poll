import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttackVectorsProps {
  vectors: { [key: string]: number };
}

export default function AttackVectors({ vectors }: AttackVectorsProps) {
  const getVectorColor = (vector: string) => {
    switch (vector.toLowerCase()) {
      case 'sql injection': return 'bg-red-600';
      case 'brute force': return 'bg-orange-600';
      case 'xss attempt': return 'bg-yellow-600';
      case 'port scanning': return 'bg-blue-600';
      default: return 'bg-purple-600';
    }
  };

  const vectorEntries = Object.entries(vectors).sort((a, b) => b[1] - a[1]);

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-dark-text">
          Attack Vectors (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vectorEntries.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-dark-text-secondary text-sm">No attack data available</p>
            </div>
          ) : (
            vectorEntries.map(([vector, percentage]) => (
              <div key={vector}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark-text text-sm">{vector}</span>
                  <span className="text-dark-text text-sm font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-2">
                  <div
                    className={`${getVectorColor(vector)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
