import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  family_id: string;
  child_name: string;
  schedule_name: string;
  tasks: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  name: string;
  time: string;
  description: string;
  completed: boolean;
}

export function ScheduleManager() {
  const { user } = useRoleAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    childName: '',
    scheduleName: '',
    tasks: [] as Task[]
  });
  const [newTask, setNewTask] = useState({
    name: '',
    time: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_schedules')
        .select('*')
        .eq('family_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Set sample data if fetch fails
      const sampleSchedules: Schedule[] = [
        {
          id: '1',
          family_id: user?.id || '',
          child_name: 'Alex',
          schedule_name: 'Morning Routine',
          tasks: [
            { id: '1', name: 'Wake up', time: '07:00', description: 'Get out of bed and stretch', completed: false },
            { id: '2', name: 'Brush teeth', time: '07:15', description: 'Brush for 2 minutes', completed: false },
            { id: '3', name: 'Breakfast', time: '07:30', description: 'Eat healthy breakfast', completed: false }
          ],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setSchedules(sampleSchedules);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_schedules')
        .insert([{
          family_id: user.id,
          child_name: formData.childName,
          schedule_name: formData.scheduleName,
          tasks: formData.tasks,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Schedule Created',
        description: `Schedule "${formData.scheduleName}" has been created successfully.`,
      });

      setFormData({ childName: '', scheduleName: '', tasks: [] });
      setShowCreateForm(false);
      fetchSchedules();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create schedule',
        variant: 'destructive',
      });
    }
  };

  const addTask = () => {
    if (!newTask.name || !newTask.time) return;

    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name,
      time: newTask.time,
      description: newTask.description,
      completed: false
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));

    setNewTask({ name: '', time: '', description: '' });
  };

  const removeTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const toggleTaskCompletion = async (scheduleId: string, taskId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const updatedTasks = schedule.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    try {
      const { error } = await supabase
        .from('daily_schedules')
        .update({ tasks: updatedTasks })
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(prev =>
        prev.map(s =>
          s.id === scheduleId ? { ...s, tasks: updatedTasks } : s
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading schedules...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Daily Schedules
          </h1>
          <p className="text-gray-600 mt-2">Manage daily routines and tasks</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="size-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Create Schedule Form */}
      {showCreateForm && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
            <CardDescription>Set up a daily routine for your child</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSchedule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleName">Schedule Name</Label>
                  <Input
                    id="scheduleName"
                    value={formData.scheduleName}
                    onChange={(e) => setFormData({ ...formData, scheduleName: e.target.value })}
                    placeholder="e.g., Morning Routine"
                    required
                  />
                </div>
              </div>

              {/* Add Tasks */}
              <div className="space-y-4">
                <h3 className="font-semibold">Add Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Task name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                  <Button type="button" onClick={addTask} variant="outline">
                    Add Task
                  </Button>
                </div>

                {/* Task List */}
                {formData.tasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tasks:</h4>
                    {formData.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{task.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{task.time}</span>
                          {task.description && (
                            <p className="text-sm text-gray-600">{task.description}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={!formData.childName || !formData.scheduleName || formData.tasks.length === 0}>
                  Create Schedule
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Schedules Yet</h3>
            <p className="text-gray-500">Create your first daily schedule to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {schedules.map((schedule) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="size-5 text-blue-600" />
                        {schedule.schedule_name}
                      </CardTitle>
                      <CardDescription>
                        For {schedule.child_name}
                      </CardDescription>
                    </div>
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.tasks.map((task: Task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTaskCompletion(schedule.id, task.id)}
                            className={task.completed ? 'text-green-600' : 'text-gray-400'}
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                          <div>
                            <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.name}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-600">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="size-4" />
                          {task.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}