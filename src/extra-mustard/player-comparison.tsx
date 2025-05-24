import { useState, useMemo } from 'react';
import { bio } from '../data/bio';
import { measurements } from '../data/measurements';
import { seasonLogs } from '../data/season-logs';
import { Box, Autocomplete, TextField, Typography, Paper } from '@mui/material';

interface ComparisonStat {
  label: string;
  getValue: (playerId: number) => string | number | null;
  type: 'physical' | 'performance' | 'athletic';
}

const comparisonStats: ComparisonStat[] = [
  {
    label: 'Height',
    getValue: (playerId) => {
      const player = bio.find(p => p.playerId === playerId);
      return player ? `${Math.floor(player.height / 12)}'${player.height % 12}"` : null;
    },
    type: 'physical'
  },
  {
    label: 'Weight',
    getValue: (playerId) => {
      const player = bio.find(p => p.playerId === playerId);
      return player?.weight ? `${player.weight} lbs` : null;
    },
    type: 'physical'
  },
  {
    label: 'Wingspan',
    getValue: (playerId) => {
      const measure = measurements.find(m => m.playerId === playerId);
      return measure?.wingspan ? `${(measure.wingspan / 12).toFixed(1)}'` : null;
    },
    type: 'physical'
  },
  {
    label: 'Standing Reach',
    getValue: (playerId) => {
      const measure = measurements.find(m => m.playerId === playerId);
      return measure?.reach ? `${measure.reach}"` : null;
    },
    type: 'physical'
  },
  {
    label: 'Max Vertical',
    getValue: (playerId) => {
      const measure = measurements.find(m => m.playerId === playerId);
      return measure?.maxVertical ? `${measure.maxVertical}"` : null;
    },
    type: 'athletic'
  },
  {
    label: 'Sprint (3/4 court)',
    getValue: (playerId) => {
      const measure = measurements.find(m => m.playerId === playerId);
      return measure?.sprint ? `${measure.sprint}s` : null;
    },
    type: 'athletic'
  },
  {
    label: 'Points',
    getValue: (playerId) => {
      const stats = seasonLogs.find(s => s.playerId === playerId);
      return stats?.PTS?.toFixed(1) ?? null;
    },
    type: 'performance'
  },
  {
    label: 'Rebounds',
    getValue: (playerId) => {
      const stats = seasonLogs.find(s => s.playerId === playerId);
      return stats?.TRB?.toFixed(1) ?? null;
    },
    type: 'performance'
  },
  {
    label: 'Assists',
    getValue: (playerId) => {
      const stats = seasonLogs.find(s => s.playerId === playerId);
      return stats?.AST?.toFixed(1) ?? null;
    },
    type: 'performance'
  },
  {
    label: '3P%',
    getValue: (playerId) => {
      const stats = seasonLogs.find(s => s.playerId === playerId);
      return stats?.['3P%'] ? `${(stats['3P%'] * 100).toFixed(1)}%` : null;
    },
    type: 'performance'
  }
];

export default function PlayerComparison() {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  
  const players = useMemo(() => bio.map(player => ({
    label: player.name,
    id: player.playerId
  })), []);

  const handlePlayerSelect = (playerId: number | null) => {
    if (!playerId) return;
    
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), playerId];
      }
      return [...prev, playerId];
    });
  };

  return (
    <Box className="min-h-screen bg-[#0C2340] text-white p-6">
      <Typography variant="h4" className="text-center mb-8 font-bold text-[#00A3E0]">
        Player Comparison
      </Typography>

      <Box className="max-w-xl mx-auto mb-8">
        <Autocomplete
          options={players}
          getOptionLabel={(option) => option.label}
          onChange={(_, value) => handlePlayerSelect(value?.id ?? null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add Player (max 3)"
              variant="outlined"
              className="bg-white/10 rounded-xl"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00A3E0',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
          )}
        />
      </Box>

      {selectedPlayers.length > 0 && (
        <Paper className="max-w-4xl mx-auto bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
          <Box className="grid grid-cols-[auto_repeat(3,1fr)] gap-4">
            <Box className="font-semibold text-[#B8C4CA]">Stat</Box>
            {selectedPlayers.map(playerId => (
              <Box key={playerId} className="font-semibold text-[#00A3E0]">
                {bio.find(p => p.playerId === playerId)?.name}
              </Box>
            ))}

            {['physical', 'athletic', 'performance'].map(type => (
              <>
                <Box
                  key={type}
                  className="col-span-full text-sm font-medium text-[#00A3E0] uppercase tracking-wider mt-4 mb-2"
                >
                  {type} Metrics
                </Box>
                {comparisonStats
                  .filter(stat => stat.type === type)
                  .map(stat => (
                    <>
                      <Box key={stat.label} className="text-[#B8C4CA]">
                        {stat.label}
                      </Box>
                      {selectedPlayers.map(playerId => (
                        <Box key={`${stat.label}-${playerId}`} className="text-white">
                          {stat.getValue(playerId) ?? '-'}
                        </Box>
                      ))}
                    </>
                  ))}
              </>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}