

# Loading necessary libraries
library(dplyr)
library(ggplot2)
library(showtext)
library(scales)
library(patchwork)


font_add_google("Montserrat", "montserrat")
showtext_auto()

# Read in the fleet data
df_fleet <- read.csv("fleet2021.csv", stringsAsFactors = FALSE)

# Rename the columns
names(df_fleet) <- c("Country Name", "Total")

# Change the type of 'Total' to numeric
df_fleet$Total <- as.numeric(df_fleet$Total)

# Remove NA rows
df_fleet <- na.omit(df_fleet)

# Trim spaces from country names
df_fleet$`Country Name` <- trimws(df_fleet$`Country Name`)

# Read in the GDP data
df_gdp_raw <- read.csv("gdp.csv", stringsAsFactors = FALSE)

df_gdp_raw <- df_gdp_raw[df_gdp_raw$`Series.Name` == 'GDP (constant 2015 US$)',]

# Select only the 3rd and 5th column and rename them
df_gdp <- df_gdp_raw[, c(3, 5)]
names(df_gdp) <- c("Country Name", "GDP")

df_gdp <- df_gdp %>%
  filter(!is.na(GDP), GDP != "..", `Country Name` != "..")

# Merge the datasets on the 'Country Name' field
df_merged <- merge(df_fleet, df_gdp, by = "Country Name", all = FALSE)

df_merged$GDP <- as.numeric(df_merged$GDP)
# Apply log transformation
df_merged$Log_GDP <- log(df_merged$GDP)
df_merged$Log_Total <- log(df_merged$Total)

df_merged <- df_merged %>% filter(Log_Total > 0)


# Create a linear model
model <- lm(Log_Total ~ Log_GDP, data = df_merged)

# Get predicted values
df_merged$Predicted <- predict(model, df_merged)

# Calculate residuals (without absolute value)
df_merged$Residual <- df_merged$Log_Total - df_merged$Predicted

# Calculate the threshold
threshold <- mean(abs(df_merged$Residual)) + 0.8*sd(abs(df_merged$Residual))

# Create a new variable 'outlier' based on the threshold
df_merged$Outlier <- ifelse(abs(df_merged$Residual) > threshold, 'yes', 'no')

# Create a new variable 'OutlierType' to distinguish between those above and below the line
df_merged$OutlierType <- ifelse(df_merged$Outlier == 'yes' & df_merged$Residual > 0, 'above', ifelse(df_merged$Outlier == 'yes' & df_merged$Residual < 0, 'below', 'no'))

df_merged$aboveorbelow <- ifelse( df_merged$Residual > 0, 'above', ifelse( df_merged$Residual < 0, 'below', 'no'))



# Define the BLACK color
BLACK <- "#202020"

# Scatter plot
p1<- ggplot(df_merged, aes(x = Log_GDP, y = Log_Total)) +
  geom_point(aes(fill = aboveorbelow), shape = 21, size = 4, stroke = 0, alpha = 0.6) +  # All countries
  scale_fill_manual(values = c('below' = 'red', 'above' = 'blue', 'no' = 'black')) +
  guides(fill = FALSE) + # removes legend
  geom_smooth(aes(y = Predicted), method = "lm", se = FALSE, color = "#C23B22", linetype = "dashed") +
  geom_text(data = subset(df_merged, Outlier == 'yes'), aes(label = `Country Name`), check_overlap = TRUE, vjust = -1, size = 5, family = 'ebgaramond') +
  xlab("Log 2021 GDP (constant 2015 US$)") +
  ylab("Log Millions of Tones, 2021  Merchant Fleet's Dead Weight Tonnage") +
  ggtitle("GDP vs Merchant Fleet Size*") +
  labs(subtitle = "A closer look reveals countries whose merchant fleet strength sails beyond their economic size") +
  theme_minimal() +
  theme(
    text = element_text(family = "montserrat"),
    plot.background = element_rect(fill = 'white', color = 'lightgray'),
    plot.title = element_text(size = 20, face = "bold",color = "#202020"),
    plot.subtitle = element_text(size = 16),  # Adjust size here
    panel.grid.major.x = element_blank(),
    panel.grid.major.y = element_line(color = "#808080", size = 0.7),
    panel.grid.minor = element_blank(),
    axis.text.x = element_text(size = 10),
    axis.text.y = element_text(size = 10),
    axis.title.x = element_text(size=12,face = 'bold',color = "#202020"),
    axis.title.y = element_text(size=12,face = 'bold',color = "#202020"),
    plot.margin = margin(2, 2, 2, 2, "cm"),
  ) +
  annotate("text", x = min(df_merged$Log_GDP), y = max(df_merged$Log_Total), label = "↑ Larger fleet than expected", colour = "blue", hjust = -0.4, vjust = 14.8, size = 5) +
  annotate("text", x = min(df_merged$Log_GDP), y = min(df_merged$Log_Total), label = "↓ Smaller fleet than expected", colour = "red", hjust = -5, vjust = -22.5, size = 5,)



p <- p1 +
  annotate("text", x = min(df_merged$Log_GDP), y = min(df_merged$Log_Total), 
           label = "Sources: World Bank, UNCTAD", 
           hjust = -4, vjust = -7.5, size = 5, color = BLACK, family = "montserrat") +
  annotate("text", x = min(df_merged$Log_GDP), y = min(df_merged$Log_Total), 
           label = "*Merchant Fleet by Country of Beneficial Ownership", 
           hjust = -3.45, vjust = -7, size = 3.5, color = BLACK, family = "montserrat")+
  annotate("text", x = min(df_merged$Log_GDP), y = min(df_merged$Log_Total), 
           label = "Graph by Nikos Angelopoulos", 
           hjust = -4.6, vjust = -1.2, size = 4.5, color = BLACK, family = "montserrat")

p

write.csv(df_merged, "df_merged.csv", row.names = FALSE)
