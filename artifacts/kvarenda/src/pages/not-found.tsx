import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, useT } from "@/lib/i18n";

const notFoundText = {
  title: { en: "Page not found", ru: "Страница не найдена", uz: "Sahifa topilmadi" },
  subtitle: {
    en: "The page you're looking for doesn't exist or has been moved.",
    ru: "Страница, которую вы ищете, не существует или была перемещена.",
    uz: "Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.",
  },
  goHome: { en: "Go Home", ru: "На главную", uz: "Bosh sahifaga" },
  browseListings: { en: "Browse Listings", ru: "К объявлениям", uz: "E'lonlarni ko'rish" },
};

export default function NotFound() {
  const { t } = useI18n();
  const { tr } = useT();

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">{tr(notFoundText.title)}</h1>
        <p className="text-muted-foreground mb-8">{tr(notFoundText.subtitle)}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              {tr(notFoundText.goHome)}
            </Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {tr(notFoundText.browseListings)}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
