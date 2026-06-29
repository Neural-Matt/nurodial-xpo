import { Box } from '@mui/material';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import PersonSearchOutlined from '@mui/icons-material/PersonSearchOutlined';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import { colors } from '../../theme/palette';
import { NODE_W, NODE_H, type WorkflowNodeData, type WorkflowEdgeData } from '../../services/mock/automation';

const ICONS = {
  bolt: BoltOutlined,
  filter: FilterAltOutlined,
  phone: PhoneOutlined,
  search: PersonSearchOutlined,
  personAdd: PersonAddOutlined,
  editNote: EditNoteOutlined,
  assignment: AssignmentOutlined,
  time: AccessTimeOutlined,
  email: EmailOutlined,
  flag: FlagOutlined,
};

const TYPE_COLOR: Record<WorkflowNodeData['type'], string> = {
  trigger: colors.primary,
  condition: colors.warning,
  action: colors.info,
  delay: '#8B5CF6',
  email: colors.info,
  end: colors.success,
};

interface WorkflowCanvasProps {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  zoom: number;
}

function nodeById(nodes: WorkflowNodeData[], id: string) {
  const node = nodes.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown workflow node: ${id}`);
  return node;
}

function elbowPath(x1: number, y1: number, x2: number, y2: number) {
  const midY = y1 + (y2 - y1) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}

export function WorkflowCanvas({ nodes, edges, zoom }: WorkflowCanvasProps) {
  const width = Math.max(...nodes.map((n) => n.x)) + NODE_W / 2 + 40;
  const height = Math.max(...nodes.map((n) => n.y)) + NODE_H / 2 + 40;

  return (
    <Box sx={{ overflow: 'auto', bgcolor: '#fafafa', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', p: 2, maxHeight: height + 40 }}>
      <Box sx={{ position: 'relative', width, height, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <defs>
            <marker id="workflow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#9CA3AF" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const from = nodeById(nodes, edge.from);
            const to = nodeById(nodes, edge.to);
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={elbowPath(from.x, from.y + NODE_H / 2, to.x, to.y - NODE_H / 2)}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth={1.5}
                markerEnd="url(#workflow-arrow)"
              />
            );
          })}
        </svg>
        {edges.filter((edge) => edge.label).map((edge) => {
          const from = nodeById(nodes, edge.from);
          const to = nodeById(nodes, edge.to);
          const midY = from.y + NODE_H / 2 + (to.y - NODE_H / 2 - (from.y + NODE_H / 2)) / 2;
          return (
            <Box
              key={`${edge.from}-${edge.to}-label`}
              sx={{
                position: 'absolute',
                left: (from.x + to.x) / 2,
                top: midY,
                transform: 'translate(-50%, -50%)',
                bgcolor: edge.labelColor === 'success' ? 'rgba(31,169,113,0.12)' : 'rgba(59,130,246,0.12)',
                color: edge.labelColor === 'success' ? 'success.main' : 'info.main',
                fontSize: 11,
                fontWeight: 700,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {edge.label}
            </Box>
          );
        })}
        {nodes.map((node) => {
          const Icon = ICONS[node.icon];
          return (
            <Box
              key={node.id}
              sx={{
                position: 'absolute',
                left: node.x - NODE_W / 2,
                top: node.y - NODE_H / 2,
                width: NODE_W,
                height: NODE_H,
                bgcolor: 'background.paper',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
              }}
            >
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                flexShrink: 0,
                bgcolor: `${TYPE_COLOR[node.type]}1F`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon sx={{ fontSize: 18, color: TYPE_COLOR[node.type] }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.title}</Box>
                <Box sx={{ fontSize: 10.5, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.subtitle}</Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
