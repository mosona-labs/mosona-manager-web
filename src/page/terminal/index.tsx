import { ArrowLeftRight, LayoutGrid, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ServerTerminalCard from './card';

import AddServer from '@/components/add-server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonGroup } from '@/components/ui/button-group';

const Terminal = () => {
    const navigator = useNavigate();

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
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
                        onClick={() => navigator('/terminal')}
                    >
                        <ArrowLeftRight />
                        Monitor Mode
                    </Button>
                    <AddServer />
                </div>
            </div>
            <div className="relative">
                <p className="absolute h-full flex items-center px-2">$</p>
                <Input
                    placeholder="Find a host or SSH (e.g., user@hostname)"
                    className="border-0 ps-6"
                />
            </div>

            {/* Config */}
            <div className="mt-4 flex flex-row justify-between items-center">
                <div className="flex flex-row gap-3">
                    <ButtonGroup className="border rounded-lg">
                        <Button variant={'ghost'} className="bg-accent">
                            All
                        </Button>
                        <Button variant={'ghost'} className="border-e">
                            Category 1
                        </Button>
                        <Button variant={'ghost'}>Category 2</Button>
                    </ButtonGroup>
                </div>
                <ButtonGroup>
                    <Button variant="outline">
                        <LayoutGrid />
                    </Button>
                    <Button variant="outline">
                        <SortAsc />
                    </Button>
                </ButtonGroup>
            </div>

            {/* Server */}
            <div className="mt-4">
                <p className="mt-4 opacity-65">Category 1</p>
            </div>
            <div className="mt-2 grid gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                <ServerTerminalCard />
            </div>
        </div>
    );
};

export default Terminal;
