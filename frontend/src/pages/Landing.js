import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from '@mui/material';
import {
  FamilyRestroom,
  Home,
  TrendingUp,
  AccountBalance,
  Security,
  Devices,
  GitHub,
  ArrowForward,
  CheckCircle,
  Star,
  ContentCopy,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getVersionDisplay } from '../utils/version';

const features = [
  {
    icon: <FamilyRestroom sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Multi-user Households',
    description: 'Role-based access with owner/member permissions for collaborative financial management.',
    emoji: '👨👩👧👦'
  },
  {
    icon: <Home sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: 'Asset Management',
    description: 'Track property, stocks, gold, mutual funds, and insurance policies in one place.',
    emoji: '🏠'
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />,
    title: 'Financial Tracking',
    description: 'Monitor income, expenses, and transfers with flexible categorization.',
    emoji: '💰'
  },
  {
    icon: <AccountBalance sx={{ fontSize: 40, color: 'info.main' }} />,
    title: 'Budget Planning',
    description: 'Create budgets and monitor spending against targets with smart alerts.',
    emoji: '📊'
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />,
    title: 'Dashboard Analytics',
    description: 'Net worth tracking, asset allocation, and comprehensive expense analysis.',
    emoji: '📈'
  },
  {
    icon: <Security sx={{ fontSize: 40, color: 'error.main' }} />,
    title: 'Enterprise Security',
    description: 'JWT authentication, bcrypt password hashing, and rate limiting protection.',
    emoji: '🔒'
  },
  {
    icon: <Devices sx={{ fontSize: 40, color: 'primary.light' }} />,
    title: 'Responsive Design',
    description: 'Seamless experience across desktop, tablet, and mobile devices.',
    emoji: '📱'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Financial Advisor',
    content: 'AssetNest has transformed how I manage my family\'s finances. The multi-user feature is brilliant!',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Small Business Owner',
    content: 'The asset tracking and budget planning features are exactly what I needed. Highly recommended!',
    rating: 5
  },
  {
    name: 'Emily Johnson',
    role: 'Investment Manager',
    content: 'Clean interface, powerful analytics, and robust security. Perfect for serious financial management.',
    rating: 5
  }
];

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img 
                src="/images/logo.png" 
                alt="AssetNest Logo" 
                style={{ height: '48px', width: 'auto' }}
              />
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                AssetNest
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                sx={{ color: 'text.primary' }}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                sx={{ bgcolor: 'primary.main' }}
              >
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          pt: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    AssetNest
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{
                      fontWeight: 300,
                      mb: 3,
                      opacity: 0.9,
                    }}
                  >
                    Your Complete Financial Management Solution
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.1rem',
                      mb: 4,
                      opacity: 0.8,
                      lineHeight: 1.6,
                    }}
                  >
                    Manage assets, track expenses, plan budgets, and grow your wealth with our comprehensive financial platform designed for families and individuals.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grow in timeout={1500}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      maxWidth: 400,
                    }}
                  >
                                         <Typography variant="h6" gutterBottom align="center">
                       {getVersionDisplay()}
                     </Typography>
                     <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                       Open source financial management platform
                     </Typography>
                     <Button
                       variant="contained"
                       fullWidth
                       startIcon={<GitHub />}
                       component="a"
                       href="https://github.com/naidu/AssetNest"
                       target="_blank"
                       rel="noopener noreferrer"
                       sx={{
                         bgcolor: 'rgba(255,255,255,0.2)',
                         color: 'white',
                         '&:hover': {
                           bgcolor: 'rgba(255,255,255,0.3)',
                         },
                       }}
                     >
                       View on GitHub
                     </Button>
                  </Paper>
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Everything you need to take control of your financial future
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Grow in timeout={500 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {feature.emoji} {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 600, mb: 2 }}
            >
              What Users Say
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Join thousands of satisfied users managing their finances with AssetNest
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Grow in timeout={600 + index * 200}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                        ))}
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}
                      >
                        "{testimonial.content}"
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white',
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Ready to Transform Your Financial Management?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Start your journey towards better financial health today
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Get Started Free
              </Button>
                             <Button
                 variant="outlined"
                 size="large"
                 startIcon={<GitHub />}
                 component="a"
                 href="https://github.com/naidu/AssetNest"
                 target="_blank"
                 rel="noopener noreferrer"
                 sx={{
                   borderColor: 'white',
                   color: 'white',
                   '&:hover': {
                     borderColor: 'white',
                     bgcolor: 'rgba(255,255,255,0.1)',
                   },
                   px: 4,
                   py: 1.5,
                 }}
               >
                 View on GitHub
               </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Donations Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Support AssetNest
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Help us keep AssetNest free and open source
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
              Your donations help us maintain and improve AssetNest for everyone. Every contribution makes a difference!
            </Typography>
          </Box>
          
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  PayPal
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Quick and easy donations
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    p: 1.5, 
                    borderRadius: 1,
                    color: 'white',
                    wordBreak: 'break-all',
                    mb: 1
                  }}>
                    me@btrnaidu.com
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard('me@btrnaidu.com')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Bitcoin
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Cryptocurrency donations
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    p: 1.5, 
                    borderRadius: 1,
                    color: 'white',
                    wordBreak: 'break-all',
                    fontSize: '0.75rem',
                    mb: 1
                  }}>
                    39bqKDKvyRmoHEXWaGcxuQf8aCaSoNfb3L
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard('39bqKDKvyRmoHEXWaGcxuQf8aCaSoNfb3L')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Ethereum
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  ETH and ERC-20 tokens
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    p: 1.5, 
                    borderRadius: 1,
                    color: 'white',
                    wordBreak: 'break-all',
                    fontSize: '0.75rem',
                    mb: 1
                  }}>
                    0xa6b7afc3d05f3197cd5b36a23270d92e31e45041
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard('0xa6b7afc3d05f3197cd5b36a23270d92e31e45041')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                AssetNest
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Your complete financial management solution for families and individuals.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {features.slice(0, 4).map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature.title}
                    size="small"
                    sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" align="center" sx={{ opacity: 0.6 }}>
              © 2024 AssetNest. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 