import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Input } from './ui/input';
import { Button } from './ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import { DatePicker } from './date-picker';

const AddServer = () => {
    const [authType, setAuthType] = useState<'password' | 'key'>('password');

    // Billing Information
    const [startTime, setStartTime] = useState<Date>();
    const [endTime, setEndTime] = useState<Date>();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus />
                    Add Server
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add Server</DialogTitle>
                    <DialogDescription>
                        To add a new server for monitoring, please enter its details below.
                        Providing SSH information allows remote terminal access while monitoring,
                        but this is optional.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col max-h-[60vh] overflow-y-auto md:max-h-none md:flex-row">
                    <div className="flex-1 max-h-[70vh] overflow-y-auto">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="LAX1" />
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="flex-2 grid gap-3">
                                    <Label htmlFor="host">IP / Hostname</Label>
                                    <Input id="host" placeholder="1.2.3.4" />
                                </div>
                                <div className="flex-1 grid gap-3">
                                    <Label htmlFor="port">Port</Label>
                                    <Input
                                        id="port"
                                        placeholder="22"
                                        type="number"
                                        min={1}
                                        max={65535}
                                        step={1}
                                        defaultValue={22}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" defaultValue="root" placeholder="root" />
                            </div>
                            <Label htmlFor="auth">Authorization</Label>
                            <Tabs
                                id="auth"
                                defaultValue="password"
                                value={authType}
                                onValueChange={(e) => {
                                    console.log(e);
                                    setAuthType(e === 'password' ? 'password' : 'key');
                                }}
                            >
                                <TabsList className="w-full">
                                    <TabsTrigger value="password">Password</TabsTrigger>
                                    <TabsTrigger value="key">Key</TabsTrigger>
                                </TabsList>
                                <TabsContent value="password">
                                    <Input id="password" placeholder="Password" />
                                </TabsContent>
                                <TabsContent value="key">
                                    <Input id="password" placeholder="Password" />
                                    <div className="mt-2 flex flex-row gap-1.5">
                                        <Select>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Key" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Key1</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline">
                                            <Plus />
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                            <div className="flex flex-row justify-between mt-1 gap-3">
                                <Label htmlFor="monitor">Monitor Access</Label>
                                <Switch id="monitor" defaultChecked />
                            </div>
                            <div className="flex flex-row justify-between gap-3">
                                <Label htmlFor="terminal">Terminal Access</Label>
                                <Switch id="terminal" defaultChecked />
                            </div>
                        </div>
                    </div>
                    <div className="border-s border-b md:mx-3 mb-4 mt-5 md:my-0" />
                    <div className="flex-2 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col gap-3">
                            <Label>Display</Label>
                            <Card className="py-4">
                                <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="weight">Weight (Sort)</Label>
                                        <Input
                                            id="weight"
                                            placeholder="0"
                                            type="number"
                                            min={0}
                                            step={1}
                                            defaultValue={0}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="note">Note (Private)</Label>
                                        <Input id="note" />
                                    </div>
                                    <div className="flex flex-row mt-1 justify-between md:col-span-2">
                                        <Label htmlFor="hidden">Hidden for monitor</Label>
                                        <Switch id="hidden" defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                            <Label>Billing Information</Label>
                            <Card className="py-4">
                                <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="data-center">Provider / Data Center</Label>
                                        <Input
                                            id="data-center"
                                            placeholder="AWS, DigitalOcean, etc."
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="bill-cycle">Cycle</Label>
                                        <Select defaultValue="none">
                                            <SelectTrigger id="bill-cycle" className="w-full">
                                                <SelectValue placeholder="Select Cycle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="one-time">One-Time</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                                <SelectItem value="semi-annually">
                                                    Semi-Annually
                                                </SelectItem>
                                                <SelectItem value="annually">Annually</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="start-time">
                                            Start Time{' '}
                                            <Button
                                                variant={'outline'}
                                                className="rounded-2xl text-xs py-0 px-2 h-5"
                                                size="sm"
                                                onClick={() => setStartTime(undefined)}
                                            >
                                                Clear
                                            </Button>
                                        </Label>
                                        <DatePicker
                                            id="start-time"
                                            date={startTime}
                                            setDate={setStartTime}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="end-time">
                                            End Time
                                            <Button
                                                variant={'outline'}
                                                className="rounded-2xl text-xs py-0 px-2 h-5"
                                                size="sm"
                                                onClick={() => setStartTime(undefined)}
                                            >
                                                Clear
                                            </Button>
                                        </Label>
                                        <DatePicker
                                            id="end-time"
                                            date={endTime}
                                            setDate={setEndTime}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bill-note">
                                            Amount
                                            <Button
                                                variant={'outline'}
                                                className="rounded-2xl text-xs py-0 px-2 h-5"
                                                size="sm"
                                                onClick={() => setStartTime(undefined)}
                                            >
                                                Free
                                            </Button>
                                            <Button
                                                variant={'outline'}
                                                className="rounded-2xl text-xs py-0 px-2 h-5"
                                                size="sm"
                                                onClick={() => setStartTime(undefined)}
                                            >
                                                Pay as you go
                                            </Button>
                                        </Label>
                                        <Input id="bill-amount" placeholder="€100" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="bill-auto-renew">Auto Renew</Label>
                                        <Switch id="bill-auto-renew" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Label>Network Information</Label>
                            <Card className="py-4">
                                <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="bandwidth">Bandwidth</Label>
                                        <Input id="bandwidth" placeholder="1Gbps" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="bandwidth">Traffic</Label>
                                        <Input id="bandwidth" placeholder="1TB/Mo" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="bandwidth">Traffic Type</Label>
                                        <Select defaultValue="none">
                                            <SelectTrigger id="traffic-type" className="w-full">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="inbound">Inbound</SelectItem>
                                                <SelectItem value="outbound">Outbound</SelectItem>
                                                <SelectItem value="both">Both</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="network-note">Note (Public)</Label>
                                        <Input id="network-note" placeholder="AS114514" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Server</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddServer;
