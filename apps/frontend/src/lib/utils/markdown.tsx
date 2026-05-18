const NODE_PREFIXES = [
  "destination_node",
  "budget_node",
  "hotel_node",
  "itinerary_node",
  "coordinator_node",
  "router_node",
];

function cleanContent(content: string): string {
  let cleaned = content;

  for (const prefix of NODE_PREFIXES) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length);
      break;
    }
  }

  // Adiciona \n antes de ## colado ao texto anterior
  cleaned = cleaned.replace(/([^\n])(#{1,3} )/g, "$1\n$2");

  // Adiciona \n antes de bullet points colados
  cleaned = cleaned.replace(/([^\n\-])(- )/g, "$1\n$2");

  // Corrige # simples que deveria ser ##
  cleaned = cleaned.replace(/^# ([A-Z])/gm, "## $1");

  // Corrige **Heading**- seguido de conteúdo
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*-\s*/g, "\n## $1\n\n- ");
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*:\s*-\s*/g, "\n## $1\n\n- ");

  return cleaned.trimStart();
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

type Props = { content: string };

export function MarkdownRenderer({ content }: Props) {
  const cleaned = cleanContent(content);
  const lines = cleaned.split("\n");

  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        // Ignora linhas com apenas # solto
        if (line.trim() === "#" || line.trim() === "##" || line.trim() === "###") {
          return null;
        }

        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="font-bold text-base mt-4 mb-1 text-foreground">
              {renderInline(line.slice(3))}
            </h2>
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground">
              {renderInline(line.slice(4))}
            </h3>
          );
        }

        if (line.trim() === "---") {
          return <hr key={i} className="my-3 border-border" />;
        }

        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 text-foreground ml-2">
              <span className="shrink-0 mt-0.5">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }

        // Trata **Heading** sozinho na linha como h3
        if (/^\*\*[^*]+\*\*:?\s*$/.test(line.trim())) {
          return (
            <h3 key={i} className="font-bold text-sm mt-3 mb-1 text-foreground">
              {line.replace(/\*\*/g, "").replace(/:$/, "").trim()}
            </h3>
          );
        }

        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }

        return (
          <p key={i} className="text-foreground leading-relaxed">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}