import {
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Flame,
  FolderOpen,
  Tag,
  ThumbsUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TbChartBarPopular } from "react-icons/tb";
import SidebarCategories from "@/app-components/SidebarCategories";
import TrendingComponent from "@/app-components/TrendingComponent";



export const metadata = {
  title: "Story Nest",
  description: "Where story have life ...",
};


export default function Homepage() {

  return (
    <div className=" bg-gradient-to-br from-[#fdfbfb] via-[#ebedee] to-[#dfe9f3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        <div className="block lg:hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="all-filters">
              <AccordionTrigger className=" font-semibold py-2 px-4 bg-gray-200 dark:bg-gray-800 rounded-md">
                Browse ...
              </AccordionTrigger>
              <AccordionContent className="mt-4 space-y-4">

                <Accordion type="multiple" className="space-y-4">

                  <AccordionItem value="popular">
                    <AccordionTrigger className="text-base font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                      <TbChartBarPopular className="mr-2" /> Popular
                    </AccordionTrigger>
                    <AccordionContent>
                      <SidebarPopular />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="trending">
                    <AccordionTrigger className="text-base font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                      <TrendingUp className="mr-2" /> Trending
                    </AccordionTrigger>
                    <AccordionContent>
                      <SidebarTrending />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-base font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                      <FolderOpen className="mr-2" /> Categories
                    </AccordionTrigger>
                    <AccordionContent>
                      <SidebarCategories />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tags">
                    <AccordionTrigger className="text-base font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                      <Tag className="mr-2" /> Tags
                    </AccordionTrigger>
                    <AccordionContent>
                      <SidebarTags />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>

              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-20 gap-6">
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <SidebarPopular />
            <SidebarTrending />
          </aside>
          <main className="lg:col-span-14">
            <div className="h-full min-h-[300px]">
              <h1 className="font-bold text-2xl border-b-2 border-gray-200 py-1">Trending</h1>
              <TrendingComponent/>
              <h1 className="font-bold text-2xl border-b-2 border-gray-200 py-1">Most favorites</h1>
              <TrendingComponent />
              <h1 className="font-bold text-2xl border-b-2 border-gray-200 py-1">Engaging</h1>
              <TrendingComponent />
            </div>
          </main>
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <SidebarCategories />
            <SidebarTags />
          </aside>
        </div>
      </div>
    </div>
  );
}


function SidebarPopular() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="space-y-2 p-4">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 font-roboto">
          <TbChartBarPopular /> Popular
        </h2>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-sm p-2 bg-primaryGradient rounded text-white"><Eye size={16} /> Most Viewed</li>
          <li className="flex items-center gap-2 text-sm p-2 bg-primaryGradient rounded text-white"><Clock size={16} /> Most Recent</li>
          <li className="flex items-center gap-2 text-sm p-2 bg-primaryGradient rounded text-white"><Heart size={16} /> Most Liked</li>
          <li className="flex items-center gap-2 text-sm p-2 bg-primaryGradient rounded text-white"><Share2 size={16} /> Most Shared</li>
          <li className="flex items-center gap-2 text-sm p-2 bg-primaryGradient rounded text-white"><MessageSquare size={16} /> Comments</li>
        </ul>
      </CardContent>
    </Card>
  );
}


function SidebarTrending() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="space-y-2 p-4">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 font-roboto">
          <TrendingUp /> Trending
        </h2>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-sm bg-gradientbg p-2 rounded text-white"><Clock size={16} /> Today</li>
          <li className="flex items-center gap-2 text-sm bg-gradientbg p-2 rounded text-white"><Clock size={16} /> This Week</li>
          <li className="flex items-center gap-2 text-sm bg-gradientbg p-2 rounded text-white"><Clock size={16} /> This Month</li>
          <li className="flex items-center gap-2 text-sm bg-gradientbg p-2 rounded text-white"><Clock size={16} /> This Year</li>
          <li className="flex items-center gap-2 text-sm bg-gradientbg p-2 rounded text-white"><Flame size={16} /> All Time</li>
        </ul>
      </CardContent>
    </Card>
  );
}

function SidebarTags() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="space-y-2 p-4">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 font-roboto">
          <Tag /> Tags
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-foreground text-background  p-2 rounded cursor-pointer">#webdev</span>
          <span className="bg-foreground text-background p-2 rounded cursor-pointer">#javascript</span>
          <span className="bg-foreground text-background p-2 rounded cursor-pointer">#react</span>
          <span className="bg-foreground text-background p-2 rounded cursor-pointer">#design</span>
        </div>
      </CardContent>
    </Card>
  );
}


