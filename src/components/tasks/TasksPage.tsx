import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { PsychologistTask } from '../../types/clinic';
import {
  ListTodo,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useClinic();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PsychologistTask['category']>('clinico');
  const [newDueDate, setNewDueDate] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newCategory, newDueDate || undefined);
    setNewTitle('');
    setNewDueDate('');
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.completed) ||
      (filterStatus === 'pending' && !task.completed);
    return matchesCategory && matchesStatus;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 w-full animate-fade-slide-up">
      {/* Header */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#452267] text-white flex items-center justify-center shadow-sm">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#452267] dark:text-white tracking-tight">
              Minhas Tarefas &amp; Afazeres
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#faf5ec] dark:bg-[#281b45] border border-[#e8dfd2] dark:border-[#3d2b63] text-[#452267] dark:text-white">
            {completedCount} de {tasks.length} concluídas
          </span>
        </div>
      </div>

      {/* Add Task Box */}
      <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-3xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#452267] mb-3">
          Nova Tarefa
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Adicionar nova tarefa"
            className="flex-1 px-4 py-2.5 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-2xl text-xs font-medium text-[#452267] dark:text-white placeholder:text-[#a897c4] focus:outline-none focus:border-[#452267] transition-all"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-2xl text-xs font-semibold text-[#452267] dark:text-white focus:outline-none focus:border-[#452267] cursor-pointer"
          >
            <option value="clinico">Clínico</option>
            <option value="administrativo">Administrativo</option>
            <option value="academico">Acadêmico</option>
            <option value="pessoal">Pessoal / Rotina</option>
          </select>

          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="px-3 py-2.5 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-2xl text-xs font-semibold text-[#452267] dark:text-white focus:outline-none focus:border-[#452267]"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-5 py-2.5 bg-[#452267] hover:bg-[#380a3b] disabled:opacity-40 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#452267]" />
          <span className="text-xs font-bold text-[#705e8b] dark:text-slate-400">Filtrar:</span>
          <div className="flex items-center bg-white dark:bg-[#1f1535] p-1 rounded-2xl border border-[#ece4f6] dark:border-[#3d2b63] text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#452267] text-white shadow-2xs'
                  : 'text-[#705e8b] dark:text-slate-400'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-[#452267] text-white shadow-2xs'
                  : 'text-[#705e8b] dark:text-slate-400'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-[#452267] text-white shadow-2xs'
                  : 'text-[#705e8b] dark:text-slate-400'
              }`}
            >
              Concluídas
            </button>
          </div>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs font-semibold text-[#452267] dark:text-white focus:outline-none"
        >
          <option value="all">Todas as Categorias</option>
          <option value="clinico">Clínico</option>
          <option value="administrativo">Administrativo</option>
          <option value="academico">Acadêmico</option>
          <option value="pessoal">Pessoal / Rotina</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-3xl p-6 shadow-xs space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#705e8b] dark:text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-[#452267] mx-auto opacity-40 mb-2" />
            <p className="font-bold text-sm text-[#452267] dark:text-white">Nenhuma tarefa encontrada</p>
            <p>Aproveite o momento livre ou cadastre um novo compromisso acima.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-all border ${
                task.completed
                  ? 'bg-[#faf8fd]/50 dark:bg-[#251940]/50 border-transparent opacity-70'
                  : 'bg-[#faf8fd] dark:bg-[#251940] border-[#ece4f6] dark:border-[#3d2b63] hover:border-[#452267]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-[#452267] border-[#452267] text-white'
                      : 'border-[#452267] bg-white dark:bg-[#1f1535] hover:border-[#452267]'
                  }`}
                >
                  {task.completed && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <div className="truncate">
                  <span
                    onClick={() => toggleTask(task.id)}
                    className={`text-xs font-semibold cursor-pointer block truncate ${
                      task.completed
                        ? 'line-through text-[#8675a3] dark:text-slate-500'
                        : 'text-[#452267] dark:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="text-[10px] text-[#705e8b] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#452267]" />
                      Data limite: {task.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.category && (
                  <span className="text-[10px] uppercase font-bold text-[#452267] dark:text-[#ded6f4] bg-[#faf5ec] dark:bg-[#452267] border border-[#e8dfd2] dark:border-[#3d2b63] px-2 py-0.5 rounded-lg">
                    {task.category}
                  </span>
                )}

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Excluir tarefa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
