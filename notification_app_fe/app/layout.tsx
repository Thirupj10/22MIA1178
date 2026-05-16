"use client";
import { ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Link from "next/link";

const theme = createTheme({
  palette: {
    primary: { main: "#1565C0" },
    secondary: { main: "#E3F2FD" },
    background: { default: "#F5F7FA" },
  },
  typography: {
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="sticky" elevation={2}>
            <Toolbar sx={{ gap: 2 }}>
              <NotificationsIcon />
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                Campus Notifications
              </Typography>
              <Button color="inherit" component={Link} href="/">
                Priority Inbox
              </Button>
              <Button color="inherit" component={Link} href="/all">
                All Notifications
              </Button>
            </Toolbar>
          </AppBar>
          <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 4 }}>
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}