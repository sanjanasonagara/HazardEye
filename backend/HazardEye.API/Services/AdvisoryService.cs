using HazardEye.API.Data;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HazardEye.API.Services;

public class AdvisoryService : IAdvisoryService
{
    private readonly HazardEyeDbContext _context;

    public AdvisoryService(HazardEyeDbContext context)
    {
        _context = context;
    }

    public async Task<IncidentSeverity> DetermineSeverityAsync(Dictionary<string, object> mlMetadata)
    {
        // Get active severity rules ordered by priority
        var rules = await _context.SeverityRules
            .Where(r => r.IsActive)
            .OrderBy(r => r.Priority)
            .ToListAsync();

        foreach (var rule in rules)
        {
            if (EvaluateCondition(rule.Condition, mlMetadata))
            {
                if (Enum.TryParse<IncidentSeverity>(rule.Severity, out var severity))
                {
                    return severity;
                }
            }
        }

        // Default severity based on confidence if available
        if (mlMetadata.TryGetValue("confidence", out var confObj))
        {
            var confidence = Convert.ToDouble(confObj);
            if (confidence >= 0.9) return IncidentSeverity.Critical;
            if (confidence >= 0.7) return IncidentSeverity.High;
            if (confidence >= 0.5) return IncidentSeverity.Medium;
        }

        return IncidentSeverity.Low;
    }

    public async Task<IncidentCategory> DetermineCategoryAsync(Dictionary<string, object> mlMetadata)
    {
        // Try to get category from ML metadata
        if (mlMetadata.TryGetValue("category", out var catObj))
        {
            var categoryStr = catObj.ToString() ?? "";
            if (Enum.TryParse<IncidentCategory>(categoryStr, true, out var category))
            {
                return category;
            }
        }

        // Try to infer from detections
        if (mlMetadata.TryGetValue("detections", out var detectionsObj))
        {
            var detections = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(detectionsObj.ToString() ?? "[]");
            if (detections != null && detections.Any())
            {
                var firstDetection = detections.First();
                if (firstDetection.TryGetValue("label", out var labelObj))
                {
                    var label = labelObj.ToString()?.ToLower() ?? "";
                    if (label.Contains("fire")) return IncidentCategory.Fire;
                    if (label.Contains("chemical")) return IncidentCategory.Chemical;
                    if (label.Contains("ppe") || label.Contains("helmet") || label.Contains("vest")) return IncidentCategory.PPE;
                    if (label.Contains("electrical") || label.Contains("wire")) return IncidentCategory.Electrical;
                    if (label.Contains("structural") || label.Contains("crack")) return IncidentCategory.Structural;
                }
            }
        }

        return IncidentCategory.Other;
    }

    public async Task<string> GenerateAdvisoryAsync(Dictionary<string, object> mlMetadata, IncidentSeverity severity)
    {
        // Get active advisory templates
        var templates = await _context.AdvisoryTemplates
            .Where(t => t.IsActive)
            .ToListAsync();

        // Simple template matching - in production, use a proper template engine
        var template = templates.FirstOrDefault(t => 
            t.Rules.ContainsKey("severity") && 
            t.Rules["severity"].ToString() == severity.ToString());

        if (template != null)
        {
            var advisory = template.Template;
            
            // Replace placeholders
            if (mlMetadata.TryGetValue("confidence", out var conf))
                advisory = advisory.Replace("{{confidence}}", $"{conf:P0}");
            
            if (mlMetadata.TryGetValue("detections", out var detections))
                advisory = advisory.Replace("{{detections}}", detections.ToString() ?? "");

            return advisory;
        }

        // Default advisory
        return $"Safety incident detected with {severity} severity. Please review and take appropriate action.";
    }

    private bool EvaluateCondition(string condition, Dictionary<string, object> mlMetadata)
    {
        try
        {
            // Simple condition evaluation - in production, use a proper expression evaluator
            var conditionObj = JsonSerializer.Deserialize<Dictionary<string, object>>(condition);
            if (conditionObj == null) return false;

            foreach (var kvp in conditionObj)
            {
                if (!mlMetadata.TryGetValue(kvp.Key, out var value))
                    return false;

                var expectedValue = kvp.Value.ToString();
                var actualValue = value.ToString();

                if (expectedValue != actualValue)
                    return false;
            }

            return true;
        }
        catch
        {
            return false;
        }
    }
}

