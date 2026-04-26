import { ArrowLeftRight, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import useTerminals from './hook';
import CategoryCard from './components/category';
import TerminalSkeletonCard from './components/skeleton-card.tsx';

import AddServer from '@/components/server/add';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonGroup } from '@/components/ui/button-group';
import { useUser } from '@/context/useUser';
import ManageCategory from '@/components/category/manage';
import AddCategory from '@/components/category/add';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';

const Terminal = () => {
    const { categories } = useUser();

    const navigator = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    const { isLoading, categoryServerMap, categoryFilter, setCategoryFilter } = useTerminals();

    const [filter, setFilter] = useState<string>('');
    const isDefaultCategory = (categoryName: string) =>
        categoryName.trim().toLowerCase() === 'default';

    useEffect(() => {
        let fadeInTimer: number | undefined;
        let fadeOutTimer: number | undefined;

        if (isLoading) {
            setShowSkeleton(true);
            setMounted(false);
        } else {
            fadeInTimer = window.setTimeout(() => setMounted(true), 60);
            fadeOutTimer = window.setTimeout(() => setShowSkeleton(false), 420);
        }

        return () => {
            if (fadeInTimer) window.clearTimeout(fadeInTimer);
            if (fadeOutTimer) window.clearTimeout(fadeOutTimer);
        };
    }, [isLoading]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 relative">
            {showSkeleton ? (
                <div
                    className="absolute inset-5 z-40 pointer-events-none overflow-hidden transition-opacity duration-400"
                    style={{ opacity: isLoading ? 1 : 0 }}
                >
                    <div className="flex flex-row justify-between items-center mb-3">
                        <div>
                            <div className="h-8 w-32 rounded bg-muted-foreground/10 animate-pulse" />
                            <div className="mt-2 h-4 w-72 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="hidden h-10 w-36 rounded bg-muted-foreground/8 animate-pulse lg:block" />
                            <div className="h-10 w-28 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                    </div>
                    <div className="h-10 w-full rounded bg-muted-foreground/8 animate-pulse" />
                    <div className="mt-4 h-10 w-full sm:w-80 rounded bg-muted-foreground/8 animate-pulse" />
                    <div className="mt-4">
                        <div className="mt-4 h-4 w-28 rounded bg-muted-foreground/8 animate-pulse" />
                        <div className="category-terminal-grid mt-2">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <TerminalSkeletonCard key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            <div
                style={{
                    transition: 'opacity 400ms ease',
                    opacity: mounted ? 1 : 0,
                }}
            >
                <div
                    className="flex flex-row justify-between items-center mb-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
                    <div>
                        <h1 className="text-2xl font-bold">Terminal</h1>
                        <p className="opacity-65">
                            Access terminal to manage your servers via command line
                        </p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Button
                            className="lg:flex hidden"
                            variant={'outline'}
                            onClick={() => navigator('/')}
                        >
                            <ArrowLeftRight />
                            Monitor Mode
                        </Button>
                        <AddServer />
                    </div>
                </div>
                <div
                    className="relative"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '80ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <p className="absolute h-full flex items-center px-2">$</p>
                    <Input
                        placeholder="Search server name or address..."
                        className="border-0 ps-6"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <div
                    className="mt-4 flex flex-col gap-2 lg:flex-row justify-between lg:items-center"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '120ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <div className="flex flex-col sm:flex-row justify-between lg:justify-start gap-2">
                        <ButtonGroup className="border rounded-lg">
                            <Button
                                variant={'ghost'}
                                className={categoryFilter == null ? 'bg-accent' : ''}
                                onClick={() => setCategoryFilter(null)}
                            >
                                All
                            </Button>
                            {categories
                                ?.slice(1)
                                .slice(0, 3)
                                ?.map((category, index) => (
                                    <Button
                                        key={category.id}
                                        variant={'ghost'}
                                        className={cn(
                                            index < categories.length - 1 ? 'border-e' : undefined,
                                            categoryFilter == category.id ? 'bg-accent' : ''
                                        )}
                                        onClick={() => setCategoryFilter(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            {categories && categories.length > 4 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'ghost'}
                                            className={cn(
                                                categoryFilter &&
                                                    categories
                                                        .slice(4)
                                                        .some((c) => c.id === categoryFilter)
                                                    ? 'bg-accent'
                                                    : ''
                                            )}
                                        >
                                            ...
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-40 mt-2 p-0 bg-background">
                                        <div className="space-y-2">
                                            {categories.slice(4).map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant={'ghost'}
                                                    className={cn(
                                                        'w-full justify-start',
                                                        categoryFilter == item.id ? 'bg-accent' : ''
                                                    )}
                                                    onClick={() => setCategoryFilter(item.id)}
                                                >
                                                    {item.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </ButtonGroup>
                        <div className={'flex flex-row justify-between'}>
                            <ButtonGroup className="border rounded-lg">
                                <ManageCategory>
                                    <Button variant={'ghost'} className="border-e">
                                        <Settings />
                                    </Button>
                                </ManageCategory>
                                <AddCategory>
                                    <Button variant={'ghost'}>
                                        <Plus />
                                    </Button>
                                </AddCategory>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>

                {categoryFilter == null
                    ? categories?.map((category) => {
                          const hasServers = !!categoryServerMap[category.id];

                          if (!hasServers && isDefaultCategory(category.name)) return null;

                          return hasServers ? (
                              <CategoryCard
                                  key={category.id}
                                  category={category}
                                  categoryServerMap={categoryServerMap}
                                  filter={filter}
                                  mounted={mounted}
                              />
                          ) : (
                              <div
                                  key={category.id}
                                  style={{
                                      transition: 'opacity 400ms ease, transform 400ms ease',
                                      opacity: mounted ? 1 : 0,
                                      transform: mounted ? 'none' : 'translateY(8px)',
                                  }}
                              >
                                  <div className="mt-4">
                                      <p className="mt-4 opacity-65">{category.name}</p>
                                  </div>
                                  <div className="mt-2">
                                      <p className="text-sm text-muted-foreground/50">
                                          No servers in this category.
                                      </p>
                                  </div>
                              </div>
                          );
                      })
                    : categories
                          ?.filter((c) => c.id === categoryFilter)
                          .map((category) =>
                              categoryServerMap[category.id] ? (
                                  <CategoryCard
                                      key={category.id}
                                      category={category}
                                      categoryServerMap={categoryServerMap}
                                      filter={filter}
                                      mounted={mounted}
                                  />
                              ) : (
                                  <div
                                      key={category.id}
                                      style={{
                                          transition: 'opacity 400ms ease, transform 400ms ease',
                                          opacity: mounted ? 1 : 0,
                                          transform: mounted ? 'none' : 'translateY(8px)',
                                      }}
                                  >
                                      <div className="mt-4">
                                          <p className="mt-4 opacity-65">{category.name}</p>
                                      </div>
                                      <div className="mt-2">
                                          <p className="text-sm text-muted-foreground/50">
                                              No servers in this category.
                                          </p>
                                      </div>
                                  </div>
                              )
                          )}
            </div>
        </div>
    );
};

export default Terminal;
